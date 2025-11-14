import { Component, computed, inject, signal } from '@angular/core';
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


@Component({
  selector: 'app-create-event-page',
  imports: [ReactiveFormsModule, MatIcon, LoadingComponent],
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

  profileUserValue = computed(() => this.profileService.getProfileUser());

  imagePreview = signal<string | null>(null);
  imageFile = signal<File | null>(null);


  eventForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [ Validators.minLength(10), Validators.maxLength(500)]],
    location: ['', [Validators.required]],
    // ticketType: ['general', Validators.required],
    date: ['', [Validators.required]],
    time: ['', [Validators.required]],
    type: ['public', [Validators.required]],
    status: ['active', [Validators.required]],
    capacity: [null],
    tickets: this.fb.array([
      this.fb.group({
        type: ['general'],
        price: [0, [Validators.min(0)]],
        quantity: [0, [Validators.min(0)]]
      })
    ]),
    sellMerch: [false],
    postEventContent: [false]
  });

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
      price: [0, [Validators.min(0)]],
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
    // this.eventForm.markAllAsTouched();
    if (this.eventForm.invalid) {
      this.notificationSvc.showNotification('Por favor, corrige los errores en el formulario.', 'error');
      return;
    }

    const formValue = this.eventForm.getRawValue()

    this.loadingService.showModal('create', 'Creando evento...');

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

      // preparar tickets payload
      const formValue = this.eventForm.getRawValue();
      // FormData
      const fd = new FormData();
      fd.append('name', this.eventForm.get('name')?.value!);
      fd.append('description', this.eventForm.get('description')?.value ?? '');
      fd.append('dateTime', dateTimeISO);
      fd.append('location', this.eventForm.get('location')?.value ?? '');
      fd.append('type', formValue.type ?? 'public'); // ajustar según tu formulario
      fd.append('status', formValue.status ?? 'active'); // ajustar según convención
      fd.append('organizingHouseId', String(organizerHouseId));

      if (this.imageFile()) {
        fd.append('image', this.imageFile() as Blob, (this.imageFile() as File).name);
      }

      // enviar evento (backend puede aceptar tickets dentro del FormData como JSON)
      const ticketsPayload = (formValue.tickets || []).map((t: any) => ({
        name: t.type || 'General',
        description: t.description ?? '', // si no tienes campo description, dejar vacío
        price: Number(t.price) || 0,
        availableQuantity: Number(t.quantity) || 0
      }));
      // enviar como JSON blob para multipart
      fd.append('ticketTypes', new Blob([JSON.stringify(ticketsPayload)], { type: 'application/json' }));

      const created = await firstValueFrom(this.eventService.createEvent(fd));

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
    }
  }

  onCancel() {
    this.router.navigate(['/admin/events']);
  }
}
