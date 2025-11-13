import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { EventInterface, EventsResponse } from '../interfaces';
import { environment } from '../../../environments/environment.dev';

const apiBaseUrl = environment.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);

  getEvents() {
    return this.http.get<EventsResponse>(`${apiBaseUrl}/Events`)
    .pipe(
      tap(response => console.log('Eventos obtenidos:', response))
    )
  }

  getEventById(eventId: number) {
    return this.http.get<EventInterface>(`${apiBaseUrl}/Events/${eventId}`)
      .pipe(
        tap(res => console.log('console detail event -', res))
      )
  }
}
