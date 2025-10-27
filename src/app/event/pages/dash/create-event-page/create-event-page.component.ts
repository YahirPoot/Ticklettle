import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-event-page',
  imports: [ReactiveFormsModule],
  templateUrl: './create-event-page.component.html',
})
export class CreateEventPageComponent { 
  private fb = inject(FormBuilder);
  private router = inject(Router);

  imagePreview = signal<string | null>(null);
  imageFile = signal<File | null>(null);

  eventForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    location: ['', Validators.required],
    ticketType: ['general', Validators.required],
    date: ['', Validators.required],
    time: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    // allowReservations: [false],
    // limitedTickets: [false],
    // capacity: [null],
    sellMerch: [false],
    postEventContent: [false]
  });

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
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const payload = { ...this.eventForm.value, image: this.imageFile() }; 

    console.log('Crear evento payload', payload);
    this.imageFile.set(null);
    this.eventForm.reset();
    this.router.navigate(['/admin/event']);
  }

  onCancel() {
    this.router.navigate(['/admin/event']);
  }
}
