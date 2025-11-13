import { Component, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NotificationService } from '../../../../shared/services/notification.service';
import { TicketTypeRequest } from '../../../../ticket/interfaces';
import { MatIcon } from "@angular/material/icon";
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { LoadingModalService } from '../../../../shared/services/loading-modal.service';
import { JsonPipe } from '@angular/common';
import { AuthService } from '../../../../auth/services/auth.service';


@Component({
  selector: 'app-create-event-page',
  imports: [ReactiveFormsModule, MatIcon, LoadingComponent, JsonPipe],
  templateUrl: './create-event-page.component.html',
})
export class CreateEventPageComponent { 
  private fb = inject(FormBuilder);
  private router = inject(Router);
  
  private readonly authService = inject(AuthService);
  private notificationSvc = inject(NotificationService);
  private loadingService = inject(LoadingModalService);

  imagePreview = signal<string | null>(null);
  imageFile = signal<File | null>(null);

  userId = computed(() => this.authService.user()?.id);

  eventForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [ Validators.minLength(10), Validators.maxLength(500)]],
    location: ['', [Validators.required]],
    // ticketType: ['general', Validators.required],
    date: ['', [Validators.required]],
    time: ['', [Validators.required]],
    // price: [0, [Validators.required, Validators.min(0)]],
    // allowReservations: [false],
    // limitedTickets: [false],
    organizerId: [this.userId()],
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

  onSubmit() {
    // this.eventForm.markAllAsTouched();
    if (this.eventForm.invalid) {
      this.notificationSvc.showNotification('Por favor, corrige los errores en el formulario.', 'error');
      return;
    }

    const formValue = this.eventForm.getRawValue()

    this.loadingService.showModal('create', 'Creando evento...');

    const payload = { 
      ...this.eventForm.value, 
      // organizerId: this.userId(),
      image: this.imageFile(), 
      tickets: (formValue.tickets || []).map((ticket: TicketTypeRequest) => ({
        type: ticket.type,
        price: ticket.price,
        quantity: ticket.quantity
      }))
    }; 

    this.notificationSvc.showNotification('Evento creado exitosamente.', 'success');  
    console.log('Crear evento payload', payload);
    setTimeout(() => {
      this.imageFile.set(null);
      this.eventForm.reset();
      this.tickets.clear();
      this.addTicketType();
      this.router.navigate(['/admin/events']);
    }, 3000);
  }

  onCancel() {
    this.router.navigate(['/admin/events']);
  }
}
