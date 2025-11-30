import { Component, computed, effect, inject, resource, signal } from '@angular/core';
import { EventService } from '../../services/event.service';
import { firstValueFrom } from 'rxjs';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { HeaderBackComponent } from '../../../shared/components/header-back/header-back.component';
import { EventInterface } from '../../interfaces';
import { PaginationService } from '../../../shared/services/pagination.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-popular-event-page',
  imports: [EventCardComponent, HeaderBackComponent, PaginationComponent],
  templateUrl: './popular-event-page.component.html',
})
export class PopularEventPageComponent { 
  private eventService = inject(EventService);
  paginationService = inject(PaginationService);

  popularEvents = signal<EventInterface[]>([]);
  loading = signal(false);
  
  error = signal<string | null>(null);

  private reloadPopularEventsEffect = effect(() => {
    this.paginationService.page();
    this.loadPopularEvents(this.paginationService.page());
  });

  loadPopularEvents(page: number) {
    this.loading.set(true);
    this.error.set(null);

    this.eventService.getEvents({
      "SpecialFilter.IsPopular": true,
      Page: page,
      PageSize: this.paginationService.pageSize()
    }).subscribe({
      next: (response) => {
        this.popularEvents.set(response.items);
        this.paginationService.totalPages.set(response.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los eventos populares.');
        this.loading.set(false);
      }
    })
  }

  onPageChange(newPage: number) {
    this.paginationService.setPage(newPage);
  }

  goBack() {
    window.history.back();
  }
}
