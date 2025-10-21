import { Component, input } from '@angular/core';
import { Event } from '../../interfaces';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'event-card',
  imports: [MatIconModule, RouterLink, SlicePipe],
  templateUrl: './event-card.component.html',
})
export class EventCardComponent {
  event = input.required<Event>();
}
