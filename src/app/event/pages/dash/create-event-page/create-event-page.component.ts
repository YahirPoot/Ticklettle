import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NotificationService } from '../../../../shared/services/notification.service';
import { TicketTypeRequest } from '../../../../ticket/interfaces';
import { MatIcon } from "@angular/material/icon";
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { LoadingModalService } from '../../../../shared/services/loading-modal.service';
// import { JsonPipe } from '@angular/common';
import { AuthService } from '../../../../auth/services/auth.service';
import { ProfileService } from '../../../../profile/services/profile.service';
import { firstValueFrom } from 'rxjs';
import { EventService } from '../../../services/event.service';
import { ImageCloudinaryUploadService } from '../../../../shared/services/image-cloudinary-upload.service';
import { CreateEventRequest, ProductRequest } from '../../../interfaces';


@Component({
  selector: 'app-create-event-page',
  imports: [CommonModule, ReactiveFormsModule, MatIcon, LoadingComponent],
  templateUrl: './create-event-page.component.html',
})
export class CreateEventPageComponent { 
  private fb = inject(FormBuilder);
  private router = inject(Router);
  
  private readonly authService = inject(AuthService);
  private notificationSvc = inject(NotificationService);
  private loadingService = inject(LoadingModalService);
  private profileService = inject(ProfileService);
  private eventService = inject(EventService);
  private imageUploadSvc = inject(ImageCloudinaryUploadService);

  profileUserValue = computed(() => this.profileService.getProfileUser());

  imagePreview = signal<string | null>(null);
  imageFile = signal<File | null>(null);
  // files & previews for products
  productFiles: (File | null)[] = [];
  productPreviews: string[] = [];


  eventForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [ Validators.minLength(10), Validators.maxLength(500)]],
    location: ['', [Validators.required]],
    // ticketType: ['general', Validators.required],
    date: ['', [Validators.required]],
    time: ['', [Validators.required]],
    type: ['Gratis', [Validators.required]],
    capacity: [null],
    tickets: this.fb.array([]),
    products: this.fb.array([]),
    sellMerch: [false],
    postEventContent: [false]
  });

  isFree(): boolean {
    return (this.eventForm.get('type')?.value ?? '').toString() === 'Gratis';
  }

  get products(): FormArray {
    return this.eventForm.get('products') as FormArray;
  }

  addProduct() {
    this.products.push(this.fb.group({
      name: [''],
      description: [''],
      productPrice: [0, [Validators.min(0)]],
      stock: [0, [Validators.min(0)]],
      imageUrl: ['']
    }));
    // keep parallel arrays in sync
    this.productFiles.push(null);
    this.productPreviews.push('');
  }

  removeProduct(idx: number) {
    if (this.products.length <= 0) return;
    this.products.removeAt(idx);
    this.productFiles.splice(idx, 1);
    this.productPreviews.splice(idx, 1);
  }

  onProductFileChange(e: Event, idx: number) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.productFiles[idx] = file;
    if (!file) {
      this.productPreviews[idx] = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.productPreviews[idx] = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  get tickets(): FormArray {
    return this.eventForm.get('tickets') as FormArray;
  }

  get capacityControl(): FormControl<number | null> {
    return this.eventForm.get('capacity') as FormControl<number | null>;
  }

  // devuelve número (0 = ilimitado)
  capacityValue(): number {
    const v = this.capacityControl?.value;
    return v == null ? 0 : Number(v);
  }

  // opcional: para mostrar texto "Ilimitado"
  capacityDisplay(): string {
    const v = this.capacityControl?.value;
    return v == null ? 'Ilimitado' : String(v);
  }

  addTicketType() {
    this.tickets.push(this.fb.group({
      type: ['general'],
      ticketPrice: [0, [Validators.min(0)]],
      quantity: [0, [Validators.min(0)]]
    }))
  }

  removeTicketType(idx: number) {
    if (this.tickets.length <= 1) return;

    this.tickets.removeAt(idx);
  }

  totalTicketsCount():number {
    return (this.tickets.controls as FormGroup[])
      .map(c => Number(c.get('quantity')?.value || 0))
      .reduce((a, b) => a + b, 0);
  }


  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    if (!file) return;
    this.imageFile.set(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview.set(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  async onSubmit() {
    // Marcar controles y validar: solo los campos con Validators.required impedirán el envío
    this.eventForm.markAllAsTouched();
    if (this.eventForm.invalid) {
      this.notificationSvc.showNotification('Por favor, corrige los errores en el formulario.', 'error');
      console.log('Formulario inválido', this.eventForm.errors, this.eventForm);
      return;
    }

    const formValue = this.eventForm.getRawValue();

    this.loadingService.showModal('create', 'Iniciando creación de evento...');
    this.eventForm.disable();

   try {
      // obtener organizerHouseId desde profile
      const profile = await firstValueFrom(this.profileService.getProfileUser());
      const organizerHouseId = profile?.organizingHouses?.[0]?.organizingHouseId;
      if (!organizerHouseId) {
        this.notificationSvc.showNotification('No se encontró una casa organizadora asociada a tu perfil.', 'error');
        this.loadingService.hideModalImmediately();
        return;
      }

      // construir dateTime ISO
      const date = this.eventForm.get('date')?.value;
      const time = this.eventForm.get('time')?.value;
      const dateTimeISO = new Date(`${date}T${time}`).toISOString();
      this.loadingService.hideModalImmediately();

      // Subii imagen primeor a  cloudinary (si existe) y obtener imageUrl
      this.loadingService.showModal('create', 'Subiendo imagen del evento...');
      let imageUrl = '';
      const file = this.imageFile();
      if (file) {
        const img = new FormData();
        img.append('imageFile', file, file.name);
        const uploadRes = await firstValueFrom(this.imageUploadSvc.uploadImageToCloudinary(img));
        imageUrl = uploadRes.url;
      }
      // Contruir ticketTypes: si el evento es "gratis" forzar price = 0
      const isFree = this.isFree();
      const ticketsPayload = (formValue.tickets || []).map((t: any) => ({
        name: t.type || 'pago',
        description: t.description ?? '', // si no tienes campo description, dejar vacío
        price: isFree ? 0 : Number(t.ticketPrice) || 0,
        availableQuantity: Number(t.quantity) || 0
      }));

      
      this.loadingService.showModal('create', 'Subiendo imagen de los productos...');
      // Preparar productos: subir imágenes y mapear campos
      const productsPayload = [] as ProductRequest[];
      for (let i = 0; i < this.products.length; i++) {
        this.loadingService.showModal('create', `Subiendo imagen de producto ${i + 1}/${this.products.length}...`);
        const pCtrl = this.products.at(i);
        const pRaw = pCtrl.getRawValue();
        const file = this.productFiles[i];
        let prodImageUrl = pRaw.imageUrl || '';
        if (file) {
          const pd = new FormData();
          pd.append('imageFile', file, file.name);
          try {
            const up = await firstValueFrom(this.imageUploadSvc.uploadImageToCloudinary(pd));
            prodImageUrl = up.url;
          } catch (err) {
            console.warn('Error subiendo imagen de producto', err);
          }
        }

        productsPayload.push({
          name: pRaw.name || '',
          description: pRaw.description || '',
          price: Number(pRaw.productPrice),
          stock: Number(pRaw.stock) || 0,
          imageUrl: prodImageUrl
        });
      }

      this.loadingService.showModal('create', 'Ya casi terminando...');
      const createeEventRequest: CreateEventRequest = {
        name: this.eventForm.get('name')?.value!,
        description: this.eventForm.get('description')?.value ?? '',
        dateTime: dateTimeISO,
        location: this.eventForm.get('location')?.value ?? '',
        type: isFree ? 'Gratis' : 'Pago', // ajustar según tu formulario
        status: 'Activo', // siempre Activo al crear el evento
        organizingHouseId: organizerHouseId,
        imageUrl: imageUrl,
        ticketTypes: ticketsPayload,
        products: productsPayload
      }

      await firstValueFrom(this.eventService.createEvent(createeEventRequest));
      this.notificationSvc.showNotification('Evento creado exitosamente.', 'success');

      // limpieza UI
      this.imageFile.set(null);
      this.eventForm.reset();
      this.tickets.clear();
      this.addTicketType();
      this.loadingService.hideModalImmediately();
      this.notificationSvc.showNotification('Evento creado exitosamente.', 'success');
      this.router.navigate(['/admin/events']);
    } catch (err) {
      console.error('Error creando evento', err);
      this.notificationSvc.showNotification('Error al crear el evento.', 'error');
      this.loadingService.hideModalImmediately();
      this.eventForm.enable();
    }
  }

  onCancel() {
    this.router.navigate(['/admin/events']);
  }
}
