import { inject, Injectable } from '@angular/core';
import { EventInterface } from '../interfaces';
import { environment } from '../../../environments/environment.dev';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs';

const apiBaseUrl = environment.apiBaseUrl;

export interface FavoriteDto {
  favoriteId: number;
  attendeId: number;
  eventId: number;
  event: EventInterface;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteEventService {
  private http = inject(HttpClient);

  getFavoriteEventsByAttendee() {
    return this.http.get<FavoriteDto[]>(`${apiBaseUrl}/Favorite`)
      .pipe(
        catchError(err => {
          console.error('Error fetching favorite events:', err);
          throw err;
        })
      );
  }

  addFavoriteEvent(eventId: number) {
    return this.http.post(`${apiBaseUrl}/Favorite/${eventId}`, {})
  }

  removeFavoriteEvent(eventId: number) {
    return this.http.delete(`${apiBaseUrl}/Favorite/${eventId}`)
  }
}
