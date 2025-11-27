import { Component, inject, resource, signal } from '@angular/core';
import { EventService } from '../../services/event.service';
import { firstValueFrom } from 'rxjs';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { HeaderBackComponent } from '../../../shared/components/header-back/header-back.component';

@Component({
  selector: 'app-popular-event-page',
  imports: [EventCardComponent, HeaderBackComponent],
  templateUrl: './popular-event-page.component.html',
})
export class PopularEventPageComponent { 
  private eventService = inject(EventService);

  popularFilter = signal<Record<string, any> | null>({ 'SpecialFilter.IsPopular': true });

  popularEventsResource = resource({
    loader: () => firstValueFrom(this.eventService.getEvents(this.popularFilter() ?? undefined)
    )
  });

  get popularEvents() {
    return this.popularEventsResource.value();
  }

  goBack() {
    window.history.back();
  }
}
