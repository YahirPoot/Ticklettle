import { Component, computed, effect, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../auth/services/auth.service';
import { IsNotAuthenticatedComponent } from '../../../shared/components/is-not-authenticated/is-not-authenticated.component';
import { TicketService } from '../../services/ticket.service';
import { TicketInterface } from '../../interfaces';
import { PaginationService } from '../../../shared/services/pagination.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { DatePipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-ticket-page',
  imports: [IsNotAuthenticatedComponent, RouterLink, MatIconModule, PaginationComponent, DatePipe, UpperCasePipe],
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

  selectedStatus = signal<string>('Activo');


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

  applyFilters() {
    // Reset pagination to first page and force a reload with current filters
    this.paginationService.reset();
    // Allow the reload effect to re-request even if same page was previously requested
    this.lastRequestPage.set(null);

    // If user is authenticated, trigger loading immediately
    if (this.isAuthenticated()) {
      const page = this.paginationService.page();
      this.loadTickets(page);
    }
  }

  onFilterChange(value: string) {
    this.selectedStatus.set(value);
    // apply filters immediately when select changes
    this.applyFilters();
  }

  private mapStatusToApi(status: string): string {
    if (!status) return 'Activo';
    const s = status.toLowerCase();
    if (s === 'active' || s === 'activo') return 'Activo';
    if (s === 'expired' || s === 'vencido' || s === 'vencidos') return 'Vencido';
    return status;
  }

  loadTickets(page: number) {
    const isInitial = (this.tickets() ?? []).length === 0;
    this.initialLoading.set(isInitial);
    this.pageLoading.set(!isInitial);
    const status = this.mapStatusToApi(this.selectedStatus());
    console.log('Loading tickets with filters:', { 'Filter.StatusTicket': status, Page: page, PageSize: this.paginationService.pageSize() });

    this.ticketService.getTicketsByAttendee({
      "Filter.StatusTicket": status,
      Page: page,
      PageSize: this.paginationService.pageSize()
    }).subscribe({
      next: (res) => {
        this.tickets.set(res.items);
        // Update pagination service with values from the response
        if (res.totalPages !== undefined && res.totalPages !== null) {
          this.paginationService.setTotalPages(res.totalPages);
        }
        if (res.page !== undefined && res.page !== null) {
          this.paginationService.setPage(res.page);
        }
        if (res.pageSize !== undefined && res.pageSize !== null) {
          this.paginationService.setPageSize(res.pageSize);
        }
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

