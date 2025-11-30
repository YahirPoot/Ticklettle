import { Component, inject, resource, signal, computed, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from "@angular/router";
import { EventService } from '../../../services/event.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { NotificationService } from '../../../../shared/services/notification.service';
import { PaginationService } from '../../../../shared/services/pagination.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { EventInterface } from '../../../interfaces';

@Component({
  selector: 'app-dash-event-page',
  imports: [RouterLink, MatIconModule, CommonModule, ReactiveFormsModule, ConfirmModalComponent, PaginationComponent],
  templateUrl: './dash-event-page.component.html',
})
export class DashEventPageComponent {

  private eventService = inject(EventService);
  notificationService = inject(NotificationService);
  paginationService = inject(PaginationService);


  events = signal<EventInterface[]>([]);
  initialLoading = signal(false);
  pageLoading = signal(false);

  error = signal<string | null>(null);
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
  selectedToDelete = signal<number | null>(null);
  selectedName = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.paginationService.page()
      this.loadEvents(this.paginationService.page());
    })
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

  loadEvents(page: number) {
    const isInitial = (this.events() ?? []).length == 0;
    this.initialLoading.set(isInitial);
    this.pageLoading.set(!isInitial);
    this.error.set(null);

    this.eventService.getEventsOrganizer(page, this.paginationService.pageSize()).subscribe({
      next: (res) => {
        this.events.set(res.items);
        this.paginationService.totalPages.set(res.totalPages);
        this.initialLoading.set(false);
        this.pageLoading.set(false);
      },
      error: (err) => {
        this.error.set('Error cargando los eventos. Intenta de nuevo más tarde.',);
        this.initialLoading.set(false);
        this.pageLoading.set(false);
      }
    })
  }

  onPageChange(newPage: number) {
    this.paginationService.setPage(newPage);
  }

  async confirmDelete() {
    const id = this.selectedToDelete();
    if (id == null) return;

    try {
      await firstValueFrom(this.eventService.deleteEvent(id));
    } catch (e) {
      this.notificationService.showNotification('Error eliminando el evento. Intenta de nuevo más tarde.', 'error');
      console.error('Error eliminando evento', e);
    } finally {
      this.notificationService.showNotification('Evento eliminado correctamente.', 'success');
      // this.eventResource.reload();
      this.showConfirm.set(false);
    }
  }

  /** 🔥 Filtrado real time */
   filteredEvents = computed(() => {
    const rawTerm = this.searchTerm();
    const term = rawTerm.trim().toLowerCase();

    const list = this.events() ?? [];
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
