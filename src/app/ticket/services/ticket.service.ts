import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.dev';
import { ClaimFreeTicketRequest, ResponseTicketInterface, TicketInterface } from '../interfaces';

const apiBaseUrl = environment.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);

  getTicketsByAttendee(page: number, pageSize: number): Observable<ResponseTicketInterface> {
    return this.http.get<ResponseTicketInterface>(`${apiBaseUrl}/Tickets/my-tickets`,
      {
        params: {
          page, 
          pageSize
        }
      }
    )
      .pipe(
        tap(res => console.log('Tickets obtenidos:', res))
      )
  }

  getTicketById(ticketId: number): Observable<TicketInterface> {
    return this.http.get<TicketInterface>(`${apiBaseUrl}/Tickets/${ticketId}`
    ).pipe(
      tap(res => console.log('Ticket obtenido:', res))
    )
  }

  claimFreetickets(requestClaimFree: ClaimFreeTicketRequest): Observable<ClaimFreeTicketRequest> {
    return this.http.post<ClaimFreeTicketRequest>(`${apiBaseUrl}/Tickets/claim-free`,
      requestClaimFree
    )
  }

  getTicketShareUrl(ticketId: number): Observable<{ saveLink: string }> {
    return this.http.get<{ saveLink: string }>(`${apiBaseUrl}/Tickets/${ticketId}/google-wallet-link`)
    .pipe(
      tap(res => console.log('Ticket share URL obtenido:', res))
    );
  }  

}