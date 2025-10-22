import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Event } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);

  private readAll(): Event[] {
    return JSON.parse(localStorage.getItem('events') || '[]');
  }

  private writeAll(events: Event[]) {
    localStorage.setItem('events', JSON.stringify(events));  
  }

  private async ensureSeed(): Promise<void> {
    if (this.readAll().length) return;

    const events = await firstValueFrom(this.http.get<Event[]>('/mock/events.json'));
    this.writeAll(events || []);
  }

  async all(): Promise<Event[]> {
    await this.ensureSeed();
    return this.readAll();
  }

  async featured(): Promise<Event | null> { 
    const all = await this.all();
    return all.find(e => e.featured) ?? null; 
  }

  async popular(): Promise<Event[]> { 
    const all = await this.all(); 
    return all.filter(e => e.popular); 
  }

  async upcoming(): Promise<Event[]> {
    const all = await this.all(); const now = new Date();
    return all.filter(e => new Date(e.date) > now).sort((a,b)=>+new Date(a.date)-+new Date(b.date ));
  }
  
  async byId(id: string | number): Promise<Event | null> {
    const all = await this.all(); 
    return all.find((e) => e.id == id) ?? null;
  }
}
