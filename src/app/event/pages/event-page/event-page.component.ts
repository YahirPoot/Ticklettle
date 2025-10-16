import { Component } from '@angular/core';
import { EventCarouselComponent } from '../../components/event-carousel/event-carousel.component';

@Component({
  selector: 'event-page',
  imports: [EventCarouselComponent],
  templateUrl: './event-page.component.html',
})
export class EventPageComponent { }
