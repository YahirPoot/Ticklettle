import { Component, computed, effect, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../auth/services/auth.service';
import { IsNotAuthenticatedComponent } from '../../../shared/components/is-not-authenticated/is-not-authenticated.component';
import { TicketService } from '../../services/ticket.service';
import { TicketInterface } from '../../interfaces';
import { PaginationService } from '../../../shared/services/pagination.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-ticket-page',
  imports: [IsNotAuthenticatedComponent, RouterLink, MatIconModule, PaginationComponent],
  templateUrl: './ticket-page.component.html',
})
export class TicketPageComponent { 
  authService = inject(AuthService);
  private ticketService = inject(TicketService);
  paginationService = inject(PaginationService);

  isAuthenticated = computed(() => this.authService.authStatus() === 'authenticated');

  tickets = signal<TicketInterface[]>([]);

  initialLoading = signal(false);
  pageLoading = signal(false);

  private lastRequestPage = signal<number | null>(null);
  private reloadTimer: any = null;

  private reloadTicketsEffect = effect(() => {
    const page = this.paginationService.page();
    const auth = this.isAuthenticated();

    // no cargar si el usuario no está autenticado
    if (!auth) return;

    // si ya pedimos esta página, no hacer nada
    if (this.lastRequestPage() === page) return;

    // debounce corto para evitar ráfagas de llamadas (ej. varios cambios de página en UI)
    clearTimeout(this.reloadTimer);
    this.reloadTimer = setTimeout(() => {
      this.lastRequestPage.set(page);
      this.loadTickets(page);
    }, 150);

    // cleanup al re-ejecutar
    return () => clearTimeout(this.reloadTimer);
  });

  loadTickets(page: number) {
    const isInitial = (this.tickets() ?? []).length === 0;
    this.initialLoading.set(isInitial);
    this.pageLoading.set(!isInitial);
    
    this.ticketService.getTicketsByAttendee(page, this.paginationService.pageSize()).subscribe({
      next: (res) => {
        this.tickets.set(res.items);
        this.initialLoading.set(false);
        this.pageLoading.set(false);
      }, 
      error: (err) => {
        console.error('Error fetching tickets:', err);
        this.initialLoading.set(false);
        this.pageLoading.set(false);
      }
    })
  }  

  onPageChange(newPage: number) {
    this.paginationService.setPage(newPage);
  }

}

