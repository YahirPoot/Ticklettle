import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { EventCarouselComponent } from '../../../event/components/event-carousel/event-carousel.component';

@Component({
  selector: 'app-home-page',
  imports: [EventCarouselComponent],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {


}
