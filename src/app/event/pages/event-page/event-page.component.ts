import { Component, inject, resource } from '@angular/core';
import { EventCarouselComponent } from '../../components/event-carousel/event-carousel.component';
import { EventService } from '../../services/event.service';
import { DatePipe, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'event-page',
  imports: [EventCarouselComponent, SlicePipe, RouterLink, DatePipe],
  templateUrl: './event-page.component.html',
})
export class EventPageComponent {
  private eventService = inject(EventService);

  featuredEventResource = resource({
    loader: () => this.eventService.featured(),
  })

  get featuredEvent() {
    return this.featuredEventResource.value();
  }

}
