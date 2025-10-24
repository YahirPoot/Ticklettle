import { Component, ElementRef, inject, resource, ViewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { EventService } from '../../../event/services/event.service';
import { SlicePipe } from '@angular/common';
import { EventCarouselComponent } from '../../../event/components/event-carousel/event-carousel.component';

@Component({
  selector: 'app-home-page',
  imports: [RouterOutlet, SlicePipe, RouterLink, EventCarouselComponent],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
private eventService = inject(EventService);

  featuredEventResource = resource({
    loader: () => this.eventService.featured(),
  })

  get featuredEvent() {
    return this.featuredEventResource.value();
  }
}
