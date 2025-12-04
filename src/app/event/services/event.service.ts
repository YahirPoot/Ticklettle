import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { CreateEventRequest, EventFilter, EventInterface, EventsResponse, UpdateEventRequest } from '../interfaces';
import { environment } from '../../../environments/environment.dev';

const apiBaseUrl = environment.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);

  getEvents(filters: EventFilter): Observable<EventsResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        params = params.set(k, v);
      }
    });
    return this.http.get<EventsResponse>(`${apiBaseUrl}/Events`, { params })
  }

  getEventsOrganizer(page: number, pageSize: number) {
    return this.http.get<EventsResponse>(`${apiBaseUrl}/Events`,
      {
        params: {
          page,
          pageSize
        }
      }
    )
  }


  getEventById(eventId: number) {
    return this.http.get<EventInterface>(`${apiBaseUrl}/Events/${eventId}`)
  }

  createEvent(createEventRequest: CreateEventRequest): Observable<CreateEventRequest> {
    return this.http.post<CreateEventRequest>(`${apiBaseUrl}/Events`, createEventRequest)
  }

  updateEvent(eventId: number, updateEventRequest: UpdateEventRequest): Observable<EventInterface> {
    return this.http.put<EventInterface>(`${apiBaseUrl}/Events/${eventId}`, updateEventRequest)
      .pipe(
      //   catchError(error => {
      //     throw error;
      //   })
      );
  }

  deleteEvent(eventId: number) {
    return this.http.delete<void>(`${apiBaseUrl}/Events/${eventId}`)
      .pipe(
        catchError(err => {
          console.error('Error eliminando evento:', err);
          throw err;
        })
      );
  }
}
