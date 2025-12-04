import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { FormBuilder, ReactiveFormsModule, FormArray, Validators } from '@angular/forms';
import { EventInterface } from '../../../interfaces';
import { NotificationService } from '../../../../shared/services/notification.service';
import { LoadingModalService } from '../../../../shared/services/loading-modal.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { ImageCloudinaryUploadService } from '../../../../shared/services/image-cloudinary-upload.service';
import { HeaderBackComponent } from '../../../../shared/components/header-back/header-back.component';

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

    // procesar productos: subir imágenes nuevas y construir payload
    const productsControls = (this.updateEventForm.get('products') as FormArray).controls || [];
    const productsPayload: any[] = [];
    for (let i = 0; i < productsControls.length; i++) {
      const v = productsControls[i].value;
      let imageUrl = v.imageUrl ?? undefined;
      const file = this.productFiles[i];
      if (file) {
        const uploaded = await this.uploadIfFile(file);
        if (uploaded) imageUrl = uploaded;
      }
      const productReq: any = {
        name: v.name,
        description: v.description,
        price: v.price,
        stock: v.stock,
      };
      if (v.productId) productReq.productId = v.productId;
      if (imageUrl) productReq.imageUrl = imageUrl;
      productsPayload.push(productReq);
    }

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

    const updateRequest: any = {
      name: form.name ?? '',
      description: form.description ?? '',
      dateTime: dateTime,
      location: form.location ?? '',
      type: form.type ?? '',
      status: form.status ?? '',
      imageUrl: imageToUpload ?? '',
      ticketTypes: ticketTypesPayload,
      products: productsPayload
    };

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
