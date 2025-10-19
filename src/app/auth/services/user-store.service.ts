import { Injectable } from '@angular/core';
import { AuthUser, UserRole } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserStoreService {
  private key = 'user-data';

  private readAll(): AuthUser[] {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) as AuthUser[] : [];
  }

  private writeAll(users: AuthUser[]): void {
    localStorage.setItem(this.key, JSON.stringify(users));
  }

  public findByEmail(email: string): AuthUser | null {
    return this.readAll().find(user => user.email === email) || null;
  }

  public upset(user: AuthUser): void {
    const allUsers = this.readAll();
    const index = allUsers.findIndex(u => u.email === user.email);
    if (index >= 0) allUsers[index] = user; else allUsers.push(user);

    this.writeAll(allUsers);
  }

  public setRole(email: string, role: UserRole): AuthUser | null {
    const user = this.findByEmail(email);
    if (!user) return null;
    user.roles = [role];
    user.isRegistered = true;
    this.upset(user);
    return user;
  }

}
