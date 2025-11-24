import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.dev';
import { ResponseTicketInterface } from '../interfaces';

const apiBaseUrl = environment.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);

  getTicketsByAttendee(): Observable<ResponseTicketInterface[]> {
    return this.http.get<ResponseTicketInterface[]>(`${apiBaseUrl}/Tickets/my-tickets`)
      .pipe(
        tap(res => console.log('Tickets obtenidos:', res))
      )
  }
}
