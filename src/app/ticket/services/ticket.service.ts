import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Ticket } from '../interfaces';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);

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
