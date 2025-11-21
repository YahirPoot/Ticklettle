import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { EventInterface } from '../../../interfaces';
import { NotificationService } from '../../../../shared/services/notification.service';
import { LoadingModalService } from '../../../../shared/services/loading-modal.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { ImageCloudinaryUploadService } from '../../../../shared/services/image-cloudinary-upload.service';

@Component({
  selector: 'app-update-event-page',
  imports: [ReactiveFormsModule, LoadingComponent, MatIconModule],
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
  });
  
  originalValues = signal<EventInterface | null>(null);
  
  // computed para saber si ya llegó la data
  isLoaded = computed(() => !!this.eventResource.value());
  constructor() {
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

  hasChanges(): boolean {
    const current = this.updateEventForm.value;
    const original = this.originalValues();

    if (!original) return false;

    const [origDate = '', origTimeFull = ''] = (original.dateTime ?? '').split('T');
    const origTime = origTimeFull ? origTimeFull.substring(0, 5) : '';

    return (
      (current.name ?? '') !== (original.name ?? '') ||
      (current.description ?? '') !== (original.description ?? '') ||
      (current.date ?? '') !== (origDate ?? '') ||
      (current.time ?? '') !== (origTime ?? '') ||
      (current.location ?? '') !== (original.location ?? '') ||
      (current.type ?? '') !== (original.type ?? '') ||
      (current.status ?? '') !== (original.status ?? '') ||
      (current.imageUrl ?? '') !== (original.imageUrl ?? '')
    );
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

  onSubmit() {
    if (!this.hasChanges()) {
      this.notificationService.showNotification('No hay cambios para actualizar.', 'info');
      return;
    }

    const form = this.updateEventForm.value;

    // build ISO dateTime (if time empty, use 00:00)
    const datePart = form.date ?? '';
    const timePart = (form.time && form.time.length >= 5) ? form.time : '00:00';
    const dateTime = `${datePart}T${timePart}`;

    let imageToUpload = form.imageUrl ?? '';
    if (this.imageFile()) {
      this.notificationService.showNotification('Has seleccionado una nueva imagen.', 'info');
      const imageFile = new FormData();
      imageFile.append('imageFile', this.imageFile() as File, (this.imageFile() as File).name);
      // subir imagen de forma sincrónica (podría mejorarse)
      this.loadingService.showModal('update', 'Subiendo imagen...');
      const uploadImage = this.imageUploadService.uploadImageToCloudinary(imageFile).subscribe({
        next: (res) => {
          imageToUpload = res.url ?? '';
          this.loadingService.hideModal();
        },
        error: (err) => {
          this.loadingService.hideModal();
          this.notificationService.showNotification('Error al subir la imagen. Inténtalo de nuevo.', 'error');
          console.error('Error uploading image:', err);
          return;
        }
      });
    }

    const updateRequest = {
      name: form.name ?? '',
      description: form.description ?? '',
      dateTime: dateTime,
      location: form.location ?? '',
      type: form.type ?? '',
      status: form.status ?? '',
      imageUrl: imageToUpload ?? '',
    };

    this.loadingService.showModal('update', 'Actualizando evento...');

    this.eventService.updateEvent(this.eventId, updateRequest).subscribe({
      next: (res) => {
        this.originalValues.set(res);
        this.loadingService.hideModal();
        this.notificationService.showNotification('Evento actualizado correctamente.', 'success');
        this.router.navigate(['/admin/events/detail-event', this.eventId]);
      },
      error: (err) => {
        this.loadingService.hideModal();
        this.notificationService.showNotification('Error al actualizar el evento. Inténtalo de nuevo.', 'error');
        console.error('Error updating event:', err);
      }
    });
  }
}
