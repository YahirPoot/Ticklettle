import { Component, inject, input } from '@angular/core';
import { Event } from '../../interfaces';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { FavoriteEventService } from '../../services/favorite-event.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'event-card',
  imports: [MatIconModule, RouterLink, SlicePipe],
  templateUrl: './event-card.component.html',
})
export class EventCardComponent {
  private favoriteEventSvc = inject(FavoriteEventService);

  event = input.required<Event>();

  isFavorited(): boolean {
    if (!this.event) return false;
    return this.favoriteEventSvc.isFavorite(this.event().id);
  }

  async toggleFavorite(event: MouseEvent) {
    event.stopPropagation();
    if (!this.event()) return;
    await this.favoriteEventSvc.toggle(this.event().id); 
  }

}
