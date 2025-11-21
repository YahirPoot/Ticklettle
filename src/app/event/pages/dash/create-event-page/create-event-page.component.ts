import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIcon } from "@angular/material/icon";

import { NotificationService } from '../../../../shared/services/notification.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { LoadingModalService } from '../../../../shared/services/loading-modal.service';
import { CreateEventFormValue } from '../../../interfaces';
import { CreateEventUseCase } from '../../../use-cases/create-event.usecase';
import { HeaderBackComponent } from '../../../../shared/components/header-back/header-back.component';


@Component({
  selector: 'app-create-event-page',
  imports: [CommonModule, ReactiveFormsModule, MatIcon, LoadingComponent, HeaderBackComponent],
  templateUrl: './create-event-page.component.html',
})
export class CreateEventPageComponent { 
  private fb = inject(FormBuilder);
  private router = inject(Router);
  
  private notificationSvc = inject(NotificationService);
  private loadingService = inject(LoadingModalService);
  private createEventUseCase = inject(CreateEventUseCase);

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
    capacity: [null, [Validators.required, Validators.min(0)]],
    tickets: this.fb.array([]),
    products: this.fb.array([]),
    sellMerch: [false],
    postEventContent: [false]
  });

  constructor() {
    // mantener capacity obligatorio en ambos casos (ya definido en form control)
    this.applyTypeRules(this.eventForm.get('type')?.value);

    // suscribirse a cambios de tipo
    this.eventForm.get('type')?.valueChanges.subscribe(val => {
      this.applyTypeRules(val);
    });
  }

  private applyTypeRules(typeValue: string | null | undefined) {
    // capacity es obligatorio en ambos casos (validadores definidos en form)
    // control de tickets: si es Gratis, limpiamos y deshabilitamos; si Pago, habilitamos y aseguramos al menos 1
    if ((typeValue ?? '').toString() === 'Gratis') {
      // limpiar tickets y deshabilitarlos
      while (this.tickets.length) {
        this.tickets.removeAt(0);
      }
      this.tickets.disable({ emitEvent: false });
    } else {
      // habilitar tickets y asegurar al menos 1 tipo
      this.tickets.enable({ emitEvent: false });
      if (this.tickets.length === 0) {
        this.addTicketType();
      }
    }
  }

  isFree(): boolean {
    return (this.eventForm.get('type')?.value ?? '').toString() === 'Gratis';
  }

  get products(): FormArray {
    return this.eventForm.get('products') as FormArray;
  }

  addProduct() {
    this.products.push(this.fb.group({
      name: ['', [Validators.minLength(3)]],
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

  private buildTicketsForSubmission(formRaw: any) {
    const type = (formRaw.type ?? 'Gratis').toString();
    const capacityNum = this.capacityValue();
    if (type === 'Gratis') {
      // crear 1 tipo "gratis" con precio 0 y cantidad = capacidad (availableQuantity)
      return [{
        type: 'gratis',
        ticketPrice: 0,
        quantity: capacityNum
      }];
    }
    // Para pago, mapear los tickets del formulario (asegurarse de convertir tipos)
    return (formRaw.tickets || []).map((t: any) => ({
      type: (t?.type ?? 'general').toString(),
      ticketPrice: Number(t?.ticketPrice ?? 0),
      quantity: Number(t?.quantity ?? 0)
    }));
  }

  async onSubmit() {
    if (this.eventForm.invalid) {
      this.notificationSvc.showNotification('Por favor, completa correctamente el formulario.', 'warning');
      return;
    }

    const formRaw = this.eventForm.getRawValue();

    const ticketsForRequest = this.buildTicketsForSubmission(formRaw);

    // Mapeo a CreateEventFormValue interface
    const formValue: CreateEventFormValue = {
      name: (formRaw.name ?? '').toString(),
      description: formRaw.description ?? undefined,
      date: (formRaw.date ?? '').toString(),
      time: (formRaw.time ?? '').toString(),
      location: formRaw.location ?? undefined,
      type: (formRaw.type ?? 'Gratis').toString(),
      capacity: formRaw.capacity ?? null,
      sellMerch: Boolean(formRaw.sellMerch),
      tickets: ticketsForRequest,
      products: (formRaw.products || []).map((p: any) => ({
        name: (p?.name ?? '').toString(),
        description: p?.description ?? undefined,
        productPrice: Number(p?.productPrice ?? p?.price ?? 0),
        stock: Number(p?.stock ?? 0),
        imageUrl: p?.imageUrl ?? undefined
      })),
      postEventContent: Boolean(formRaw.postEventContent)
    };

    this.loadingService.showModal('create', 'Creando evento, por favor espera...');
    this.eventForm.disable();

    try {
      await this.createEventUseCase.execute({
        formValue,
        eventImageFile: this.imageFile(),
        productsFiles: this.productFiles
      });

      this.imageFile.set(null);
      this.eventForm.reset();
      this.tickets.clear();
      this.eventForm.get('type')?.setValue('Gratis', { emitEvent: true });
      this.notificationSvc.showNotification('Evento creado correctamente.', 'success');
    } catch (err) {
      console.error('Error creando evento', err);
      this.notificationSvc.showNotification('Error al crear el evento.', 'error');
    } finally {
      this.loadingService.hideModalImmediately();
      this.eventForm.enable();
    }
  }

  onCancel() {
    this.router.navigate(['/admin/events']);
  }

  goBack() {
    window.history.back();
  }
}
