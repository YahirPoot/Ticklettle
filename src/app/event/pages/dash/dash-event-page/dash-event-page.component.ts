import { Component, inject, resource, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from "@angular/router";
import { EventService } from '../../../services/event.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-dash-event-page',
  imports: [RouterLink, MatIconModule, CommonModule, ReactiveFormsModule, ConfirmModalComponent],
  templateUrl: './dash-event-page.component.html',
})
export class DashEventPageComponent {

  eventService = inject(EventService);

  /** Input de búsqueda */
  searchControl = new FormControl('');

  /** Control para elegir buscar por: name | city */
  searchByControl = new FormControl('name');

  /** signal que expone la opción de búsqueda */
  searchBy = signal<string>('name');

  /** Valor reactivo de búsqueda */
  searchTerm = signal<string>('');

  /* Modal / eliminación */
  showConfirm = signal(false);
  showSuccess = signal(false);
  selectedToDelete = signal<number | null>(null);
  selectedName = signal<string | null>(null);

  constructor() {
    // 🔥 Actualiza la signal cada vez que el usuario escribe
    this.searchControl.valueChanges.subscribe(v => {
      this.searchTerm.set(v?.toLowerCase() ?? '');
    });

    // Actualiza la signal cuando el usuario cambia la opción de búsqueda
    this.searchByControl.valueChanges.subscribe(v => {
      this.searchBy.set(v ?? 'name');
    });
  }

  openConfirm(eventId: number, name?: string) {
    this.selectedToDelete.set(eventId);
    this.selectedName.set(name ?? null);
    this.showConfirm.set(true);
  }

  cancelConfirm() {
    this.selectedToDelete.set(null);
    this.selectedName.set(null);
    this.showConfirm.set(false);
  }

  async confirmDelete() {
    const id = this.selectedToDelete();
    if (id == null) return;

    try {
      await firstValueFrom(this.eventService.deleteEvent(id));
    } catch (e) {
      console.error('Error eliminando evento', e);
    } finally {
      this.eventResource.reload();
      this.showConfirm.set(false);
      this.showSuccess.set(true);
      setTimeout(() => this.showSuccess.set(false), 3000);
    }
  }

  /** Resource */
  eventResource = resource({
    loader: () => firstValueFrom(this.eventService.getEventsOrganizer()),
  });

  /** Acceso a events */
  get events() {
    return this.eventResource;
  }

  /** 🔥 Filtrado real time */
   filteredEvents = computed(() => {
    const rawTerm = this.searchTerm();
    const term = rawTerm.trim().toLowerCase();

    const list = this.events.value()?.items ?? [];
    if (!term) return list;

    return list.filter(event => {
      const name = event.name?.toLowerCase() ?? '';
      const city = event.location?.toLowerCase() ?? '';

      const mode = this.searchBy();

      if (mode === 'city') return city.startsWith(term);

      // default / name
      return name.startsWith(term);
    });
  });




}
