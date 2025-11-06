import { HttpClient } from '@angular/common/http';
import { inject, Injectable, NgZone } from '@angular/core';
import { OrderRequest, OrderResponse, Ticket } from '../interfaces';
import { firstValueFrom, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.dev';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.serverBackend;
  private ngZone = inject(NgZone);

  createOrder(orderRequest: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.apiUrl}/orders`, orderRequest)
      .pipe(
        tap(res => console.log('Order created:', res))
      );
  }

  private readAll(): Ticket[] {
    return JSON.parse(localStorage.getItem('tickets') || '[]');
  }

  private writeAll(tickets: Ticket[]) {
    localStorage.setItem('tickets', JSON.stringify(tickets));  
  }

  private async ensureSeed(): Promise<void> {
    if (this.readAll().length) return;

    const tickets = await firstValueFrom(this.http.get<Ticket[]>('/mock/tickets.json'));
    this.writeAll(tickets || []);
  }

  async all(): Promise<Ticket[]> {
    await this.ensureSeed();
    return this.readAll();
  }

  async byId(id: number | string): Promise<Ticket | null> {
    const all = await this.all();
    return all.find((t) => t.id == id) ?? null;
  }

  async byStatus(status: string): Promise<Ticket[]> {
    const all = await this.all();
    return all.filter((t) => t.status.toLowerCase() === status.toLowerCase());
  }

}
