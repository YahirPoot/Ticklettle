import { Component, inject, resource, signal } from '@angular/core';
import { EventCarouselComponent } from '../../components/event-carousel/event-carousel.component';
import { EventService } from '../../services/event.service';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'event-page',
  imports: [EventCarouselComponent, RouterLink, DatePipe],
  templateUrl: './event-page.component.html',
})
export class EventPageComponent {
  private eventService = inject(EventService);

  featuredEventResource = resource({
    loader: () => firstValueFrom(this.eventService.getEvents({
      "SpecialFilter.IsUpcoming": true
    })).then(events => events.items.length > 0 ? events.items[0] : null)
  })

  get featuredEvent() {
    return this.featuredEventResource.value();
  }

}
