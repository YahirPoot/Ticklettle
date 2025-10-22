import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserStoreService } from './user-store.service';
import { firstValueFrom } from 'rxjs';
import { AuthUser } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class MockSeedServiceService {
  private http = inject(HttpClient);
  private store = inject(UserStoreService);
  private seededKey = 'mock_seeded_v1';

  async seed(): Promise<void> {
    if (localStorage.getItem(this.seededKey)) return;

    try {
      const users = await firstValueFrom(
        this.http.get<AuthUser[]>('/mock/users.json')
      );

      users.forEach(u => this.store.upsert({ ...u, isRegistered: true }));
      localStorage.setItem(this.seededKey, 'true');
    } catch (e) {
      console.warn('No se pudo cargar el seed de usuarios:', e);
    }
  }

}
