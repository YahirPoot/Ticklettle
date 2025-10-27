import { computed, inject, Injectable, signal } from '@angular/core';
import { SocialAuthService, SocialUser } from "@abacritt/angularx-social-login";
import { GoogleLoginProvider } from "@abacritt/angularx-social-login";
import { Observable, of, switchMap } from 'rxjs';
// import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthUser } from '../interfaces';
import { UserRepositoryService } from './user-repository.service';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
type UserRole = 'asistente' | 'organizador' | 'user';
type MinimalExternalUser = {
  id: string | number;
  email: string;
  name: string;
  photoUrl?: string;
  idToken?: string;
  provider?: string;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // private http = inject(HttpClient);
  private socialAuthService = inject(SocialAuthService);

  private router = inject(Router);
  private userRepository = inject(UserRepositoryService);

  private _authStatus =  signal<AuthStatus>('checking');
  private _user = signal<AuthUser | null>(null);

  authStatus = computed<AuthStatus>(() => {
    if (this._authStatus() === 'checking')  return 'checking';
    if (this._user()) {
      return 'authenticated';
    } 
    return 'not-authenticated';
  })

  user = computed(() => this._user());

  login(email: string, password: string): Observable<boolean> {
    const exisiting = this.userRepository.findByEmail(email);

    // Si el usuario existe y está registrado, iniciar sesión
    if (exisiting && exisiting.isRegistered) {
      this.handleAuthSuccess({ user: exisiting });
      return of(true);
    }

    if (exisiting && !exisiting.isRegistered) {
      this.handleAuthSuccess({ user: exisiting }, undefined);

      this.router.navigate(['/auth/select-rol']);
      return of(false);
    }
    // Si no existe, crear un nuevo usuario registrado (simula registro rápido)
    const user: AuthUser = {
      id: Date.now(),
      email,
      name: email.split('@')[0],
      picture: '',
      roles: undefined,
      isRegistered: true
    };
    // this.userRepository.upsert(user);

    this.handleAuthSuccess({ user }, false);
    this.router.navigate(['/auth/select-rol']);
    return of(true);
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }


  checkStatusAuthenticated(): Observable<boolean> {
    if (this._user()) return of(true);
    const user = localStorage.getItem('user');
    if (user) {
      this.handleAuthSuccess({ user: JSON.parse(user) });
      return of(true)
    }
    return of(false)
  }

  checkStatus(): Observable<boolean> {
    return this.checkStatusAuthenticated().pipe(
      switchMap(isAuthenticated => {
        if (isAuthenticated) return of(true);

        return of(false);
      })
    );
  }

  // Iniciar sesión con Google usando la librería
  public async signInWithGoogle(): Promise<SocialUser> {
    return this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  public signOutExternal(): Promise<void> {
    return this.socialAuthService.signOut();
  }


  public async handleExternalLogin(su: MinimalExternalUser): Promise<void> {
    if (!su.email) {
      await this.router.navigate(['/auth/login']);
      return;
    }

    const res = await this.userRepository.verifyGoogleToken(
      su.email, String(su.id), su.name, su.photoUrl || ''
    );

    if (res.isNew) {
      // sesión provisional, NO escribir en “BD” aún
      const provisional: AuthUser = {
        id: su.id,
        email: su.email,
        name: su.name,
        picture: su.photoUrl || '',
        roles: undefined,
        isRegistered: false
      };
      this.handleAuthSuccess({ user: provisional });
      await this.router.navigate(['/auth/select-rol']);
      return;
    }

    this.handleAuthSuccess({ user: res.user! });
    this.redirectByRole(res.user!.roles!);
  }

  public async completeRegistration(role: UserRole): Promise<void> {
    const user = this._user();
    if (!user) {
      await this.router.navigate(['/auth/login']);
      return;
    }

    try {
      // Llamar al mock backend (simula POST /api/auth/complete-registration)
      const response = await this.userRepository.completeRegistration(
        user.email,
        user.id.toString(),
        user.name,
        user.picture || '',
        role
      );

      this.handleAuthSuccess({ user: response.user });
      this.redirectByRole(response.user.roles!);
    } catch (error) {
      console.error('Registration error', error);
    }
  }

  public hasRole(role: UserRole): boolean {
    return this._user()?.roles!.includes(role) ?? false;
  }

  public isAuthenticated(): boolean {
    return !!this._user();
  }

  private redirectByRole(roles: UserRole[]): void {
    if (roles.includes('organizador')) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  private handleAuthSuccess({ user }: { user: AuthUser }, persist = false): boolean {
    this._user.set(user);
    this._authStatus.set('authenticated');
    localStorage.setItem('user', JSON.stringify(user));
    return true;
  }

  private clearSession() {
    this._user.set(null);
    this._authStatus.set('not-authenticated');
    // localStorage.removeItem('socialUser');
    localStorage.removeItem('user')
    // localStorage.removeItem('user_data')
  }
}
