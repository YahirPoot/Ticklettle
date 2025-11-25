import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.dev';
import { ClaimFreeTicketRequest, ResponseTicketInterface } from '../interfaces';

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

  claimFreetickets(requestClaimFree: ClaimFreeTicketRequest): Observable<ClaimFreeTicketRequest> {
    return this.http.post<ClaimFreeTicketRequest>(`${apiBaseUrl}/Tickets/claim-free`,
      requestClaimFree
    ).pipe(
      tap(res => console.log('Ticket reclamado:', res))
    )
  }
}
