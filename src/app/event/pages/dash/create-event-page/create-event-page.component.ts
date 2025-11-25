import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

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
  private notification = inject(NotificationService);
  private loadingModal = inject(LoadingModalService);
  private createEvent = inject(CreateEventUseCase);

  private readonly ticketTypes = [
    { value: 'general', label: 'General' },
    { value: 'vip', label: 'VIP' },
    { value: 'premium', label: 'Premium' }
  ];
  private nextProductId = 1;

  tagList = signal<string[]>([]);
  imagePreview = signal<string | null>(null);
  imageFile = signal<File | null>(null);

  productFiles: (File | null)[] = [];
  productPreviews: string[] = [];

  eventForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.maxLength(500)]],
    location: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    postalCode: ['', Validators.required],
    status: ['Activo', Validators.required],
    organizingHouseId: [null],
    imageUrl: [''],
    tags: [[] as string[]],
    date: ['', Validators.required],
    time: ['', Validators.required],
    type: ['Gratis', Validators.required],
    capacity: [null, [Validators.required, Validators.min(0)]],
    tickets: this.fb.array([]),
    products: this.fb.array([]),
    sellMerch: [false],
    postEventContent: [false]
  });

  constructor() {
    this.initializeFormSubscriptions();
  }

  private initializeFormSubscriptions() {
    // reglas cuando cambia tipo Gratis / Pago
    this.eventForm.get('type')?.valueChanges
      .subscribe(type => this.applyTypeRules(type));

    // limpiar productos si desactivan la venta de merch
    this.eventForm.get('sellMerch')?.valueChanges
      .subscribe(sell => !sell && this.resetProducts());

    // inicializar tags
    this.tagList.set(this.eventForm.get('tags')?.value || []);

    // aplicar reglas de tickets en inicio
    this.applyTypeRules(this.eventForm.get('type')?.value || null);
  }

  get tickets(): FormArray {
    return this.eventForm.get('tickets') as FormArray;
  }

  get products(): FormArray {
    return this.eventForm.get('products') as FormArray;
  }

  capacityControl(): FormControl<number | null> {
    return this.eventForm.get('capacity') as FormControl<number | null>;
  }

  isFree(): boolean {
    return this.eventForm.value.type === 'Gratis';
  }

  private applyTypeRules(type: string | null) {
    if (type === 'Gratis') {
      this.tickets.clear();
      this.tickets.disable({ emitEvent: false });
    } else {
      this.tickets.enable({ emitEvent: false });
      if (!this.tickets.length) this.addTicketType();
    }
  }

  addTicketType() {
    const firstAvailable = this.ticketTypes.find(
      t => !this.selectedTicketTypes().includes(t.value)
    )?.value ?? 'general';

    this.tickets.push(
      this.fb.group({
        type: [firstAvailable],
        ticketPrice: [0, Validators.min(0)],
        quantity: [0, Validators.min(0)]
      })
    );
  }

  removeTicketType(idx: number) {
    if (this.tickets.length > 1) this.tickets.removeAt(idx);
  }

  private selectedTicketTypes(): string[] {
    return this.tickets.controls.map(
      c => String(c.get('type')?.value)
    );
  }

  private hasDuplicateTicketTypes(): boolean {
    const types = this.selectedTicketTypes();
    return types.length !== new Set(types).size;
  }

  totalTicketsCount(): number {
    return this.tickets.controls.reduce(
      (acc, c) => acc + Number(c.get('quantity')?.value || 0),
      0
    );
  }

  availableTicketTypesForIndex(idx: number) {
    const selected = this.selectedTicketTypes();
    const current = this.tickets.at(idx)?.get('type')?.value;

    return this.ticketTypes.filter(opt =>
      opt.value === current || !selected.includes(opt.value)
    );
  }

  addProduct() {
    this.products.push(
      this.fb.group({
        id: [this.nextProductId++],
        name: [''],
        description: [''],
        productPrice: [0, Validators.min(0)],
        stock: [0, Validators.min(0)],
        imageUrl: ['']
      })
    );

    this.productFiles.push(null);
    this.productPreviews.push('');
  }

  removeProduct(idx: number) {
    this.products.removeAt(idx);
    this.productFiles.splice(idx, 1);
    this.productPreviews.splice(idx, 1);
  }

  resetProducts() {
    this.products.clear();
    this.productFiles = [];
    this.productPreviews = [];
  }

  onProductFileChange(e: Event, idx: number) {
    const file = (e.target as HTMLInputElement).files?.[0] ?? null;
    this.productFiles[idx] = file;

    if (!file) {
      this.productPreviews[idx] = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.productPreviews[idx] = reader.result as string;
    reader.readAsDataURL(file);
  }

  onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.imageFile.set(file);

    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  addTagFromInput(ev: KeyboardEvent & { target: HTMLInputElement }) {
    const value = ev.target.value.trim();
    if (!value) return;

    const current = this.eventForm.value.tags ?? [];
    if (!current.includes(value)) {
      const next = [...current, value];
      this.eventForm.get('tags')?.setValue(next);
      this.tagList.set(next);
    }

    ev.target.value = '';
  }

  removeTag(idx: number) {
    const current = this.eventForm.value.tags ?? [];
    current.splice(idx, 1);
    this.eventForm.get('tags')?.setValue([...current]);
    this.tagList.set([...current]);
  }

  private buildTicketsForSubmission(form: any) {
    if (form.type === 'Gratis') {
      return [{
        type: 'gratis',
        ticketPrice: 0,
        quantity: Number(form.capacity)
      }];
    }

    return (form.tickets ?? []).map((t: any) => ({
      type: t.type,
      ticketPrice: Number(t.ticketPrice),
      quantity: Number(t.quantity)
    }));
  }

  async onSubmit() {
    if (this.hasDuplicateTicketTypes()) {
      return this.notification.showNotification('Hay tipos de boleto duplicados.', 'error');
    }

    this.eventForm.markAllAsTouched();
    if (this.eventForm.invalid) {
      return this.notification.showNotification('Corrige los errores del formulario.', 'error');
    }

    const raw = this.eventForm.getRawValue();

    const request: CreateEventFormValue = {
      name: raw.name!,
      description: raw.description!,
      date: raw.date!,
      time: raw.time!,
      location: raw.location!,
      city: raw.city!,
      state: raw.state!,
      postalCode: raw.postalCode!,
      tags: raw.tags!,
      type: raw.type!,
      capacity: raw.capacity,
      sellMerch: raw.sellMerch!,
      tickets: this.buildTicketsForSubmission(raw),
      products: raw.sellMerch
        ? raw.products!.map((p: any) => ({
            name: p.name,
            description: p.description,
            productPrice: Number(p.productPrice),
            stock: Number(p.stock),
            imageUrl: p.imageUrl
          }))
        : [],
      postEventContent: raw.postEventContent!
    };

    this.loadingModal.showModal('create', 'Creando evento...');
    this.eventForm.disable();

    try {
      await this.createEvent.execute({
        formValue: request,
        eventImageFile: this.imageFile(),
        productsFiles: this.productFiles
      });

      this.notification.showNotification('Evento creado correctamente', 'success');
      this.router.navigate(['/admin/events']);
    } catch (err) {
      console.error(err);
      this.notification.showNotification('Error al crear el evento', 'error');
    } finally {
      this.loadingModal.hideModalImmediately();
      this.eventForm.enable();
    }
  }

  onCancel() {
    this.router.navigate(['/admin/events']);
  }

  goBack() {
    history.back();
  }
}