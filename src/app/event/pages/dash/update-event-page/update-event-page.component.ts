import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { FormBuilder, ReactiveFormsModule, FormArray, Validators } from '@angular/forms';
import { EventInterface, ProductRequest, UpdateEventRequest } from '../../../interfaces';
import { NotificationService } from '../../../../shared/services/notification.service';
import { LoadingModalService } from '../../../../shared/services/loading-modal.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { ImageCloudinaryUploadService } from '../../../../shared/services/image-cloudinary-upload.service';
import { HeaderBackComponent } from '../../../../shared/components/header-back/header-back.component';
import { ProductService } from '../../../../product/services/product.service';
import { UploadImageUseCase } from '../../../../shared/use-cases/upload-image-use-case';
import { EventUpdateFacadeService } from '../../../services/event-update-facade.service';
import { buildProductPayload } from '../../../utils/update-event.utils';
import {
  ensureTicketTypesForType,
  addTicketType,
  removeTicketType,
  updateTicketField,
  updateProductField,
  getTicketSoldQuantity
} from '../../../utils/update-event-form.utils';

@Component({
  selector: 'app-update-event-page',
  imports: [ReactiveFormsModule, LoadingComponent, MatIconModule, HeaderBackComponent],
  templateUrl: './update-event-page.component.html',
})
export class UpdateEventPageComponent {
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private fb = inject(FormBuilder);

  private eventService = inject(EventService);
  private imageUploadService = inject(ImageCloudinaryUploadService);
  private notificationService = inject(NotificationService);
  private loadingService = inject(LoadingModalService);
  private productService = inject(ProductService);
  private uploadImageUseCase = inject(UploadImageUseCase);
  private eventUpdateFacade = inject(EventUpdateFacadeService);

  readonly eventId: number = this.activateRoute.snapshot.params['eventId'];

  imagePreview = signal<string | null>(null);
  imageFile = signal<File | null>(null);

  // resource con loader que captura eventId por clausura
  eventResource = resource({
    loader: () => firstValueFrom(this.eventService.getEventById(this.eventId)),
  });

  updateEventForm = this.fb.group({
    name: [''],
    description: [''],
    date: [''],
    time: [''],
    location: [''],
    type: [''],
    status: [''],
    imageUrl: [''],
    products: this.fb.array([]),
    ticketTypes: this.fb.array([]),
  });
  
  // previews y archivos para productos
  productPreviews: Record<number, string> = {};
  productFiles: Record<number, File | null> = {};

  // añadir arrays para ticketTypes y products
  ngOnInitFormArrays() {
    if (!this.updateEventForm.get('ticketTypes')) {
      (this.updateEventForm as any).addControl('ticketTypes', this.fb.array([]));
    }
    if (!this.updateEventForm.get('products')) {
      (this.updateEventForm as any).addControl('products', this.fb.array([]));
    }
  }

  // getters para facilitar uso en templates
  get products() {
    return this.updateEventForm.get('products') as FormArray;
  }

  get ticketTypes() {
    return this.updateEventForm.get('ticketTypes') as FormArray;
  }
  
  originalValues = signal<EventInterface | null>(null);
  
  // computed para saber si ya llegó la data
  isLoaded = computed(() => !!this.eventResource.value());
  constructor() {
    this.ngOnInitFormArrays();
    // cuando el recurso entrega el evento, rellenamos el formulario
    effect(() => {
      const event = this.eventResource.value();
      if (!event) return;
      this.fillForm(event);
    });
    // reaccionar a cambios en el tipo para ajustar ticketTypes automáticamente
    const typeControl = this.updateEventForm.get('type');
    typeControl?.valueChanges?.subscribe((t: string | null) => {
      ensureTicketTypesForType(this.updateEventForm, this.fb, t ?? undefined);
    });
  }

  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) return; 
      this.imageFile.set(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
    }
    reader.readAsDataURL(file);
  }

  // manejo de archivos para productos
  onProductFileChange(e: Event, index: number) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;
    this.productFiles[index] = file;
    const reader = new FileReader();
    reader.onload = () => { this.productPreviews[index] = reader.result as string; };
    reader.readAsDataURL(file);
  }

  addProduct() {
    const products = this.updateEventForm.get('products') as FormArray;
    const idx = products.length;
    products.push(this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, Validators.required],
      stock: [0],
      imageUrl: ['']
    }));
    this.productPreviews[idx] = '';
    this.productFiles[idx] = null;
  }

  removeProduct(index: number) {
    const products = this.updateEventForm.get('products') as FormArray;
    const prod = products.at(index)?.value;
    if (prod?.productId) {
      this.notificationService.showNotification('No se puede eliminar un producto existente.', 'warning');
      return;
    }
    products.removeAt(index);
    delete this.productPreviews[index];
    delete this.productFiles[index];
  }

  private async uploadIfFile(file: File | null): Promise<string | undefined> {
    if (!file) return undefined;
    const fd = new FormData();
    fd.append('imageFile', file, file.name);
    try {
      const res = await firstValueFrom(this.imageUploadService.uploadImageToCloudinary(fd));
      return res?.url;
    } catch (err) {
      console.error('Error uploading product image:', err);
      return undefined;
    }
  }

  hasChanges(): boolean {
    const current = this.updateEventForm.value;
    const original = this.originalValues();

    if (!original) return false;

    const [origDate = '', origTimeFull = ''] = (original.dateTime ?? '').split('T');
    const origTime = origTimeFull ? origTimeFull.substring(0, 5) : '';

    // cambios en campos básicos
    const basicChanged = (
      (current.name ?? '') !== (original.name ?? '') ||
      (current.description ?? '') !== (original.description ?? '') ||
      (current.date ?? '') !== (origDate ?? '') ||
      (current.time ?? '') !== (origTime ?? '') ||
      (current.location ?? '') !== (original.location ?? '') ||
      (current.type ?? '') !== (original.type ?? '') ||
      (current.status ?? '') !== (original.status ?? '') ||
      (current.imageUrl ?? '') !== (original.imageUrl ?? '')
    );

    if (basicChanged) return true;

    // comparar products: cantidad o cambios en campos
    const originalProducts = original.products ?? [];
    const currentProducts = (current.products ?? []) as Array<any>;

    if (currentProducts.length !== originalProducts.length) return true;

    for (let i = 0; i < currentProducts.length; i++) {
      const cur = currentProducts[i];
      if (!cur) continue;

      // nuevo producto (sin productId) y con algún valor rellenado => cambio
      if (!cur.productId) {
        if ((cur.name ?? '').trim() !== '' || (cur.price ?? 0) > 0 || (cur.stock ?? 0) > 0 || this.productFiles[i]) {
          return true;
        }
        continue;
      }

      // producto existente: buscar en originales por productId
      const orig = originalProducts.find(p => p.productId === cur.productId);
      if (!orig) return true;

      if (
        (cur.name ?? '') !== (orig.name ?? '') ||
        (cur.description ?? '') !== (orig.description ?? '') ||
        Number(cur.price ?? 0) !== Number(orig.price ?? 0) ||
        Number(cur.stock ?? 0) !== Number(orig.stock ?? 0) ||
        (cur.imageUrl ?? '') !== (orig.imageUrl ?? '') ||
        !!this.productFiles[i] // new file selected for this index
      ) {
        return true;
      }
    }

    // comparar ticketTypes similarly
    const originalTickets = original.ticketTypes ?? [];
    const currentTickets = (current.ticketTypes ?? []) as Array<any>;

    if (currentTickets.length !== originalTickets.length) return true;

    for (let i = 0; i < currentTickets.length; i++) {
      const cur = currentTickets[i];
      const orig = originalTickets.find(t => t.ticketTypeId === cur.ticketTypeId) ?? originalTickets[i];
      if (!orig) return true;
      if (
        (cur.name ?? '') !== (orig.name ?? '') ||
        (cur.description ?? '') !== (orig.description ?? '') ||
        Number(cur.price ?? 0) !== Number(orig.price ?? 0) ||
        Number(cur.availableQuantity ?? 0) !== Number(orig.soldQuantity ?? orig.availableQuantity ?? 0)
      ) return true;
    }

    return false;
  }

  // rellena el formulario con el evento recibido y guarda los originales
  private fillForm(event: EventInterface): void {
    this.originalValues.set(event);

    this.imagePreview.set(event.imageUrl ||  null);

    const [date = '', timeFull = ''] = (event.dateTime ?? '').split('T');
    const time = timeFull ? timeFull.substring(0, 5) : '';

    this.updateEventForm.patchValue({
      name: event.name ?? '',
      description: event.description ?? '',
      date,
      time,
      location: event.location ?? '',
      type: event.type ?? '',
      status: event.status ?? '',
      imageUrl: event.imageUrl,
    }, { emitEvent: false });

    // llenar ticketTypes form array
      const ticketTypesArr = this.updateEventForm.get('ticketTypes') as FormArray;
      ticketTypesArr.clear();
      (event.ticketTypes ?? []).forEach(tt => {
        ticketTypesArr.push(this.fb.group({
          ticketTypeId: [tt.ticketTypeId],
          name: [tt.name || '', Validators.required],
          description: [tt.description || ''],
          price: [tt.price ?? 0, Validators.required],
          availableQuantity: [tt.availableQuantity ?? 0]
        }));
      });
        // asegurar que los ticketTypes estén de acuerdo al tipo actual
        ensureTicketTypesForType(this.updateEventForm, this.fb, event.type);

    // llenar products form array
    const productsArr = this.updateEventForm.get('products') as FormArray;
    productsArr.clear();
    (event.products ?? []).forEach((p, i) => {
      productsArr.push(this.fb.group({
        productId: [p.productId],
        name: [p.name || '', Validators.required],
        description: [p.description || ''],
        price: [p.price ?? 0, Validators.required],
        stock: [p.stock ?? 0],
        imageUrl: [p.imageUrl || '']
      }));
      this.productPreviews[i] = p.imageUrl || '';
      this.productFiles[i] = null;
    });

    this.updateEventForm.markAsPristine();
  }

  // restaura los valores originales al formulario
  restoreValues(): void {
    const original = this.originalValues();
    if (!original) return;

    const [date = '', timeFull = ''] = (original.dateTime ?? '').split('T');
    const time = timeFull ? timeFull.substring(0, 5) : '';

    this.updateEventForm.patchValue({
      name: original.name ?? '',
      description: original.description ?? '',
      date,
      time,
      location: original.location ?? '',
      type: original.type ?? '',
      status: original.status ?? '',
      imageUrl: original.imageUrl ?? '',
    });

    this.notificationService.showNotification('Valores restaurados', 'info');
  }

  // asegura la forma de ticketTypes según el tipo de evento
  private ensureTicketTypesForType(type: string | null | undefined) {
    const ticketTypesArr = this.updateEventForm.get('ticketTypes') as FormArray;
    const t = (type ?? '').toLowerCase();
    if (t === 'gratis') {
      // conservar primero si existe, o crear uno con price 0
      const first = ticketTypesArr.at(0)?.value;
      const qty = first?.availableQuantity ?? 0;
      ticketTypesArr.clear();
      ticketTypesArr.push(this.fb.group({
        ticketTypeId: [first?.ticketTypeId ?? undefined],
        name: ['General', Validators.required],
        description: [''],
        price: [0, Validators.required],
        availableQuantity: [qty]
      }));
      return;
    }

    // pago: asegurar General y VIP (si ya existen mantener ids/valores)
    const values = ticketTypesArr.value ?? [];
    const find = (name: string) => values.find((v: any) => (v.name ?? '').toLowerCase() === name.toLowerCase());
    const general = find('general') ?? values[0] ?? { name: 'General', price: 0, availableQuantity: 0 };
    const vip = find('vip') ?? values.find((v: any) => (v.name ?? '').toLowerCase() === 'vip') ?? { name: 'VIP', price: 0, availableQuantity: 0 };
    ticketTypesArr.clear();
    ticketTypesArr.push(this.fb.group({
      ticketTypeId: [general?.ticketTypeId ?? undefined],
      name: [general?.name ?? 'General', Validators.required],
      description: [general?.description ?? ''],
      price: [general?.price ?? 0, Validators.required],
      availableQuantity: [general?.availableQuantity ?? 0]
    }));
    ticketTypesArr.push(this.fb.group({
      ticketTypeId: [vip?.ticketTypeId ?? undefined],
      name: [vip?.name ?? 'VIP', Validators.required],
      description: [vip?.description ?? ''],
      price: [vip?.price ?? 0, Validators.required],
      availableQuantity: [vip?.availableQuantity ?? 0]
    }));
  }

  addTicketType(name = 'Custom') { addTicketType(this.updateEventForm, this.fb, name); }

  removeTicketType(index: number) { removeTicketType(this.updateEventForm, index); }

  // wrapper for template: remove ticket (guard against existing)
  removeTicket(index: number) {
    const ticket = (this.updateEventForm.get('ticketTypes') as FormArray).at(index)?.value;
    if (ticket?.ticketTypeId) {
      this.notificationService.showNotification('No se puede eliminar un tipo de boleto existente.', 'warning');
      return;
    }
    removeTicketType(this.updateEventForm, index);
  }

  // wrapper to update ticket using util
  updateTicket(index: number, field: string, event: Event) {
    const val = (event.target as HTMLInputElement).value;
    updateTicketField(this.updateEventForm, index, field, val);
  }

  // wrapper to update product using util
  updateProduct(index: number, field: string, event: Event) {
    const val = (event.target as HTMLInputElement).value;
    updateProductField(this.updateEventForm, index, field, val);
  }

  // get sold quantity via util
  getTicketSoldQuantity(index: number): number {
    return getTicketSoldQuantity(this.updateEventForm, this.originalValues(), index);
  }

  async onSubmit() {
    if (!this.hasChanges()) {
      this.notificationService.showNotification('No hay cambios para actualizar.', 'info');
      return;
    }

    const form = this.updateEventForm.value;

    // build ISO dateTime (if time empty, use 00:00)
    const datePart = form.date ?? '';
    const timePart = (form.time && form.time.length >= 5) ? form.time : '00:00';
    const dateTime = `${datePart}T${timePart}`;

    // subir imagen principal si cambió
    let imageToUpload = form.imageUrl ?? '';
    if (this.imageFile()) {
      this.notificationService.showNotification('Has seleccionado una nueva imagen.', 'info');
      this.loadingService.showModal('update', 'Subiendo imagen...');
      const uploaded = await this.uploadIfFile(this.imageFile());
      if (uploaded) imageToUpload = uploaded;
      this.loadingService.hideModal();
    }

    // usar el facade para preparar el UpdateEventRequest (subida imágenes, creación productos, payload)
    this.loadingService.showModal('update', 'Preparando actualización...');
    let prepared: { request: UpdateEventRequest; createdProducts: ProductRequest[] } | undefined;
    try {
      prepared = await this.eventUpdateFacade.prepareUpdateRequest({
        formValue: form,
        productFiles: this.productFiles,
        mainImageFile: this.imageFile(),
        mainImageUrl: imageToUpload,
        eventId: this.eventId
      });
    } catch (err) {
      console.error('Error preparing update request:', err);
      this.loadingService.hideModal();
      this.notificationService.showNotification('Error preparando la actualización. Inténtalo de nuevo.', 'error');
      return;
    }

    if (!prepared) {
      this.loadingService.hideModal();
      this.notificationService.showNotification('No se pudo preparar la actualización.', 'error');
      return;
    }

    const updateRequest = prepared.request;

    // ticketTypes payload
    const ticketTypesPayload = ((this.updateEventForm.get('ticketTypes') as FormArray).controls || []).map(tc => {
      const v = tc.value;
      const t: any = {
        name: v.name,
        description: v.description,
        price: v.price,
        availableQuantity: v.availableQuantity
      };
      if (v.ticketTypeId) t.ticketTypeId = v.ticketTypeId;
      return t;
    });

    this.loadingService.showModal('update', 'Actualizando evento...');
    try {
      const res = await firstValueFrom(this.eventService.updateEvent(this.eventId, updateRequest));
      this.originalValues.set(res);
      this.loadingService.hideModal();
      this.notificationService.showNotification('Evento actualizado correctamente.', 'success');
      this.router.navigate(['/admin/events/detail-event', this.eventId]);
    } catch (err) {
      this.loadingService.hideModal();
      this.notificationService.showNotification('Error al actualizar el evento. Inténtalo de nuevo.', 'error');
      console.error('Error updating event:', err);
    }
  }

  goBack() {
    window.history.back();
  }
}
