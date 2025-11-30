import { Component, inject, resource, signal } from '@angular/core';
import { EventCarouselComponent } from '../../components/event-carousel/event-carousel.component';
import { EventService } from '../../services/event.service';
import { DatePipe, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'event-page',
  imports: [EventCarouselComponent, SlicePipe, RouterLink, DatePipe],
  templateUrl: './event-page.component.html',
})
export class EventPageComponent {
  private eventService = inject(EventService);

  nextEventFilter = signal<Record<string, any> | null>({ 'SpecialFilter.IsUpcoming': true });

  featuredEventResource = resource({
    loader: () => firstValueFrom(this.eventService.getEvents({
      "SpecialFilter.IsUpcoming": true
    })).then(events => events.items.length > 0 ? events.items[0] : null)
  })

  get featuredEvent() {
    return this.featuredEventResource.value();
  }

}
