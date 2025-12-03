import { Component, inject, signal } from '@angular/core';
import { TicketService } from '../../../../ticket/services/ticket.service';
import { HeaderBackComponent } from '../../../../shared/components/header-back/header-back.component';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import AnalyticsService from '../../../services/analytics.service';
import AnalyticsStateService from '../../../state/analytics-state.service';
import { DatePipe } from '@angular/common';
import { AnalyticsForEventInterface, TicketDetail } from '../../../interfaces';

@Component({
  selector: 'app-event-analytics-page',
  imports: [HeaderBackComponent, DatePipe],
  templateUrl: './event-analytics-page.component.html',
})
export class EventAnalyticsPageComponent { 
  private activatedRoute = inject(ActivatedRoute);

  private analyticsService = inject(AnalyticsService);;

  readonly eventId: number = this.activatedRoute.snapshot.params['eventId'];

  analytics = signal<AnalyticsForEventInterface | null>(null);

  filteredTickets = signal<TicketDetail[]>([]);
  emptyMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  // Estado compartido para el periodo seleccionado (visible desde otros componentes)
  readonly analyticsState = inject(AnalyticsStateService);

  constructor() {
    this.loadAnalytics();
  }

  async loadAnalytics() {
    this.isLoading.set(true);
    this.analyticsService.getAnalyticsByEvent(this.eventId).subscribe({
      next: (data) => {
        this.analytics.set(data);
        this.filteredTickets.set(data.tickets); 
        this.isLoading.set(false);

      }, 
      error: (err) => {
        this.emptyMessage.set('Error al cargar los datos de analíticas.');
        console.error('Error fetching analytics data:', err);
        this.isLoading.set(false);
      }
    })
  }

  filterByPeriod(period: string) {
    // marcar periodo seleccionado en el estado compartido
    this.analyticsState.setSelectedPeriod(period);
    if (!this.analytics()) return;

    const tickets = [...this.analytics()!.tickets];
    const now = new Date();
    let filtered = tickets;

    switch (period) {
      case 'today': {
        filtered = tickets.filter(t => {
          const date = new Date(t.purchaseDate);
          return date.toDateString() === now.toDateString();
        });
        break;
      }

      case 'week': {
        const start = new Date(now);
        start.setDate(now.getDate() - 7);
        filtered = tickets.filter(t => new Date(t.purchaseDate) >= start);
        break;
      }

      case 'month': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = tickets.filter(t => new Date(t.purchaseDate) >= start);
        break;
      }

      case 'last30': {
        const start = new Date(now);
        start.setDate(now.getDate() - 30);
        filtered = tickets.filter(t => new Date(t.purchaseDate) >= start);
        break;
      }

      case 'all':
      default:
        filtered = tickets;
        break;
    }

    if (filtered.length === 0) {
      this.emptyMessage.set('No se encontraron boletos en este período.');
    } else {
      this.emptyMessage.set('');
    }

    this.filteredTickets.set(filtered);
  }
  // analyticsForEventResource = resource({
  //   loader: () =>  firstValueFrom(this.analyticsService.getAnalyticsByEvent(this.eventId)),
  // });


  // get analyticsForEvent() {
  //   return this.analyticsForEventResource.value();
  // }

  get summary() {
    return this.analytics()?.summary;
  }

  goBack() {
    window.history.back();
  }

}
