import { inject, Injectable } from '@angular/core';
import { EventService } from './event.service';
import { AuthService } from '../../auth/services/auth.service';
import { EventInterface } from '../interfaces';
import { firstValueFrom } from 'rxjs';

const KEY = 'favoriteEvents';
@Injectable({
  providedIn: 'root'
})
export class FavoriteEventService {
  private eventService = inject(EventService);
  private auth = inject(AuthService);

  private readAllMap(): Record<string, string[]> {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, string[]>;
  }

  private writeAllMap(map: Record<string, string[]>) {
    localStorage.setItem(KEY, JSON.stringify(map));
  }

  private getUserKey(): string {
    const user = this.auth.user() ?? null;
    if (!user) return 'anon';
    return String(user.id ?? user.email ?? 'anon');
  }

  getIdsForCurrentUser(): string[] {
    const map = this.readAllMap();
    const userKey = this.getUserKey();
    return map[userKey] || [];
  }

  isFavorite(eventId: number): boolean {
    const ids = this.getIdsForCurrentUser();
    return ids.includes(String(eventId));
  } 

  delete(eventId: number): void {
    const map = this.readAllMap();
    const key = this.getUserKey();
    const list = map[key] ?? [];
    const sid = String(eventId);
    const idx = list.indexOf(sid);
    if (idx >= 0) {
      list.splice(idx, 1);
      map[key] = list;
      this.writeAllMap(map);
    }
    return;
  }

  async toggle(eventId: number): Promise<boolean> {
    const map = this.readAllMap();
    const key = this.getUserKey();
    const list = map[key] ?? [];
    const sid = String(eventId);
    const idx = list.indexOf(sid);
    let added = false;
    if (idx >= 0) {
      list.splice(idx, 1);
      added = false;
    } else {
      list.unshift(sid);
      added = true;
    }
    map[key] = list;
    this.writeAllMap(map);
    return added;
  }

  async list(): Promise<EventInterface[]> {
    const ids = this.getIdsForCurrentUser();
    const events = await Promise.all(
      ids.map(id => {
        const numericId = Number(id);
        if (Number.isNaN(numericId)) return Promise.resolve(null);
        // eventService.getEventById(...) usually returns Observable<EventInterface>
        // convertimos a Promise para Promise.all usando firstValueFrom
        return firstValueFrom(this.eventService.getEventById(numericId));
      })
    );
    return events.filter(Boolean) as EventInterface[];
  }
}
