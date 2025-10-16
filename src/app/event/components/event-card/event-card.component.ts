import { Component, input } from '@angular/core';
import { Event } from '../../interfaces';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'event-card',
  imports: [MatIconModule],
  templateUrl: './event-card.component.html',
})
export class EventCardComponent {
  event = input.required<Event>();
}
