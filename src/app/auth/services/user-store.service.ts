import { Injectable } from '@angular/core';
import { AuthUser, UserRole } from '../interfaces';

const KEY = 'user_data';
@Injectable({
  providedIn: 'root'
})
export class UserStoreService {
  private readAll(): AuthUser[] {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }
  private writeAll(users: AuthUser[]): void {
    localStorage.setItem(KEY, JSON.stringify(users));
  }

  public findByEmail(email: string): AuthUser | null {
    return this.readAll().find(u => u.email === email) ?? null;
  }

  public upsert(user: AuthUser): void {
    const all = this.readAll();
    const i = all.findIndex(u => u.email === user.email);
    if (i >= 0) all[i] = user; else all.push(user);
    this.writeAll(all);
  }

  public setRole(email: string, role: UserRole): AuthUser | null {
    const u = this.findByEmail(email);
    if (!u) return null;
    u.roles = [role];
    u.isRegistered = true;
    this.upsert(u);
    return u;
  }

}
