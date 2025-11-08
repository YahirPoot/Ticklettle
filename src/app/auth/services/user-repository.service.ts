import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUser, UserRole } from '../interfaces';
import { firstValueFrom } from 'rxjs';

const KEY_USER_DATA = 'users_data';
const KEY_SEEDED = 'mock_seeded_v1';

// interfaz de respuesta de verificación (simula el login del backend cuando no se encontro al usuario dentro del sistema)
interface VerifyResponse {
  isNew: boolean;
  user?: AuthUser;
  tempUser?: { email: string; googleId: string; name: string; picture: string; };
}

// interfaz de respuesta de registro (simula el registro del backend)
interface RegisterResponse {
  user: AuthUser;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserRepositoryService {
  private http = inject(HttpClient);

  // metodo para obter todos os usuários
  private getAll(): AuthUser[] {
    try {
      return JSON.parse(localStorage.getItem(KEY_USER_DATA) || '[]');
    } catch {
      return [];
    }
  }

  // metodo para escrever todos os usuários
  private writeAll(users: AuthUser[]): void {
    localStorage.setItem(KEY_USER_DATA, JSON.stringify(users));
  }

  // metodo que funciona como login provicional
  findByEmail(email: string, password?: string): AuthUser | null {

    return this.getAll().find(user => user.email === email) || null;
  }

  // metodo para actualizar a un usuario
  upsert(user: AuthUser): void {
    // obtenes a todos los usuarios
    const all = this.getAll();
    // ahora les agregamos un id por medio de su email
    const id = all.findIndex(u => u.email === user.email);
    // si lo encuentra, actualiza, si no, agrega
    if (id >= 0) {
      all[id] = user;
    } else {
      all.push(user);
    }
    this.writeAll(all);
  }

  // metodo para asignar rol a un usuario
  setRole(email: string,  role: UserRole): AuthUser | null {
    // buscamos al usuario
    const user = this.findByEmail(email);
    // si no existe, retornamos null
    if (!user) return null;
    // asignamos el rol y marcamos como registrado
    user.roles = [role];
    user.isRegistered = true;
    // actualizamos el usuario
    this.upsert(user);
    // retornamos el usuario actualizado
    return user;
  }

  verifyCredentials(email: string, password: string): AuthUser | null {
    if (!email || !password) return null;
    const users = this.getAll();

    const user = users.find(u => u.email === email && u.password === password);
    return user || null;
  }

  // simula la verificación del token de Google en el backend 
  async verifyGoogleToken(email: string, googleId: string, name: string, picture: string): Promise<VerifyResponse> {
    // simulamos un retardo 
    await this.delay(500);
    // buscamos al usuario
    const existing = this.findByEmail(email);

    // verificamos si esta registrado o no
    if (existing && existing.isRegistered) {
      return {
        isNew: false,
        user: existing
      };
    }
    // si no existe o no esta registrado, retornamos un usuario temporal
    return {
      isNew: true,
      tempUser: { email, googleId, name, picture }
    };
  }
  
  // simula el registro del usuario en el backend
  async completeRegistration(email: string, googleId: string, name: string, photoUrl: string, role: UserRole): Promise<RegisterResponse> {
    // simulamos un retardo
    await this.delay(500);
    // creamos el objeto usuario
    const user: AuthUser = {
      id: googleId, 
      email, 
      name, 
      photoUrl,
      roles: [role],
      isRegistered: true
    };
    // lo guardamos en el almacenamiento
    this.upsert(user);
    // retornamos el usuario y un token simulado
    return {
      user, 
      token: this.generateMockToken(user)
    }
  }

  async seed(): Promise<void> {
    if (localStorage.getItem(KEY_SEEDED)) return;

    try {
      const users = await firstValueFrom(
        this.http.get<AuthUser[]>('/mock/users.json')
      );

      users.forEach(u => this.upsert({ ...u, isRegistered: true }));
      localStorage.setItem(KEY_SEEDED, 'true');
    } catch (e) {
      console.warn('No se pudo cargar el seed de usuarios:', e);
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateMockToken(user: AuthUser): string {
    return btoa(JSON.stringify({ uid: user.id, email: user.email, roles: user.roles }));
  }

}
