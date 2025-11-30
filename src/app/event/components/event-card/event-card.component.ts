import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { EventInterface } from '../../interfaces';
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
  private authService = inject(AuthService);

  private _isFavorited = signal(false)
  isFavorited = computed(() => this._isFavorited());

  isAuthenticated = computed(() => this.authService.authStatus() === 'authenticated');

  event = input.required<EventInterface>();

  showFavorite = input<boolean>(true);
  showDelete = input<boolean>(false);

  remove = output<number>();

  private checkIfFavorite = effect(() => {
    const ev = this.event();
    if (!ev) return;
    this.loadIsFavorite(ev.eventId);
  }) 

  private loadIsFavorite(eventId: number) {
    this.favoriteEventSvc.getFavoriteEventsByAttendee()
      .subscribe({
        next: (favorites) => {
          const exists = favorites.some(f => f.eventId === eventId);
          this._isFavorited.set(exists);
        },
        error: () => {
          this._isFavorited.set(false);
        }
      });
  }

  toggleFavorite(event: MouseEvent) {
    event.stopPropagation();
    if (!this.isAuthenticated()) return;

    const eventId = this.event().eventId;

    if (this._isFavorited()) {
      this.removeFavorite(eventId);
    } else {
      this.addFavorite(eventId);
    }
  }

  private addFavorite(eventId: number) {
    this.favoriteEventSvc.addFavoriteEvent(eventId)
      .subscribe({
        next: () => this._isFavorited.set(true),
        error: () => console.error("Error al agregar favorito")
      });
  }

  private removeFavorite(eventId: number) {
    this.favoriteEventSvc.removeFavoriteEvent(eventId)
      .subscribe({
        next: () => this._isFavorited.set(false),
        error: () => console.error("Error al eliminar favorito")
      });
  }


}
