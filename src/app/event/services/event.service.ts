import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { CreateEventRequest, EventInterface, EventsResponse, UpdateEventRequest } from '../interfaces';
import { environment } from '../../../environments/environment.dev';

const apiBaseUrl = environment.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);

  getEvents(filters?: Record<string, any>): Observable<EventsResponse> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(k => {
        const v = filters[k];
        if (v === null || v === undefined) return;
        params = params.set(k, String(v));
      });
    }
    return this.http.get<EventsResponse>(`${apiBaseUrl}/Events`, { params })
      .pipe(
        tap(response => console.log('Eventos obtenidos con filtros:', filters, response))
      );
  }

  getEventsAttendee() {
    return this.http.get<EventsResponse>(`${apiBaseUrl}/Events`)
    .pipe(
      tap(response => console.log('Eventos obtenidos:', response))
    )
  }

  getEventsOrganizer() {
    return this.http.get<EventsResponse>(`${apiBaseUrl}/Events`)
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

  updateEvent(eventId: number, updateEventRequest: UpdateEventRequest): Observable<EventInterface> {
    return this.http.put<EventInterface>(`${apiBaseUrl}/Events/${eventId}`, updateEventRequest)
      .pipe(
        tap(response => console.log('Evento actualizado:', response)),
        catchError(error => {
          console.log('Error al actualizar el evento:', error);
          throw error;
        })
      );
  }

  deleteEvent(eventId: number) {
    return this.http.delete<void>(`${apiBaseUrl}/Events/${eventId}`)
      .pipe(
        tap(() => console.log('Evento eliminado:', eventId)),
        catchError(err => {
          console.error('Error eliminando evento:', err);
          throw err;
        })
      );
  }
}
