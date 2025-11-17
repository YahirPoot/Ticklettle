import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Observable, tap } from 'rxjs';
import { CreateEventRequest, EventInterface, EventsResponse } from '../interfaces';
import { environment } from '../../../environments/environment.dev';

const apiBaseUrl = environment.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);

  getEventsAttendee() {
    return this.http.get<EventsResponse>(`${apiBaseUrl}/Events`)
    .pipe(
      tap(response => console.log('Eventos obtenidos:', response))
    )
  }

  getEventsOrganizer() {
    return this.http.get<EventInterface[]>(`${apiBaseUrl}/Events`)
    .pipe(
      tap(res => console.log('Eventos obtenidos organizador:', res))
    )
  }


  getEventById(eventId: number) {
    return this.http.get<EventInterface>(`${apiBaseUrl}/Events/${eventId}`)
      .pipe(
        tap(res => console.log('console detail event -', res))
      )
  }

  createEvent(createEventRequest: CreateEventRequest): Observable<CreateEventRequest> {
    return this.http.post<CreateEventRequest>(`${apiBaseUrl}/Events`, createEventRequest)
      .pipe(
        tap(response => console.log('Evento creado:', response))
      );
  }
}
