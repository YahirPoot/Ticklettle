import { Component, effect, inject, resource, signal } from '@angular/core';
import { HeaderBackComponent } from '../../../shared/components/header-back/header-back.component';
import { EventService } from '../../services/event.service';
import { firstValueFrom } from 'rxjs';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { PaginationService } from '../../../shared/services/pagination.service';
import { EventInterface } from '../../interfaces';

@Component({
  selector: 'app-next-event-page',
  imports: [HeaderBackComponent, EventCardComponent, PaginationComponent],
  templateUrl: './next-event-page.component.html',
})
export class NextEventPageComponent { 
  private eventService = inject(EventService);
  paginationService = inject(PaginationService);

  nextEvents= signal<EventInterface[]>([]);
  loading = signal(false);

  error = signal<string | null>(null);

  private reloadNextEventsEffect = effect(() => {
    this.paginationService.page()
    this.loadNextEvents(this.paginationService.page());
  });


  loadNextEvents(page: number) {
    this.loading.set(true);
    this.error.set(null);

    this.eventService.getEvents({
      "SpecialFilter.IsUpcoming": true,
      Page: page,
      PageSize: this.paginationService.pageSize()
    }).subscribe({
      next: (response) => {
        this.nextEvents.set(response.items);
        this.paginationService.totalPages.set(response.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los eventos próximos.');
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
