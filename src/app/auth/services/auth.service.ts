import { inject, Injectable } from '@angular/core';
import { SocialAuthService, SocialUser } from "@abacritt/angularx-social-login";
import { GoogleLoginProvider } from "@abacritt/angularx-social-login";
import { BehaviorSubject, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserStoreService } from './user-store.service';
import { AuthUser, UserRole } from '../interfaces';
import { MockBackendService } from './mock-backend.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private socialAuthService = inject(SocialAuthService);

  private router = inject(Router);
  private store = inject(UserStoreService);
  private mockBackend = inject(MockBackendService);

  private authChangeSub = new Subject<boolean>();
  private extAuthSub = new Subject<SocialUser | null>();

  public authChanged = this.authChangeSub.asObservable();
  public externalAuthChanged = this.extAuthSub.asObservable();

  private currentUserSub = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSub.asObservable();

  constructor() {
    const restored = this.loadUserFromStore();
    if (restored) {
      this.currentUserSub.next(restored);
      this.authChangeSub.next(true);
    }
    // Suscribirse al estado de autenticación externo (Google)
    this.socialAuthService.authState.subscribe((user: SocialUser | null) => {
      console.log('external auth state', user);
      this.extAuthSub.next(user);
      // Emitir estado booleano para suscriptores de autenticación clásica
      this.authChangeSub.next(!!user);
    });
  }

  // Emitir cambios manuales de autenticación tradicional
  public setAuthState(isAuthenticated: boolean): void {
    this.authChangeSub.next(isAuthenticated);
  }

  // Iniciar sesión con Google usando la librería
  public async signInWithGoogle(): Promise<SocialUser> {
    return this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  public signOutExternal(): Promise<void> {
    return this.socialAuthService.signOut();
  }

  // Cerrar sesión (externa)
  public async signOut(): Promise<void> {
    try {
      await this.socialAuthService.signOut();
    } catch (err) {
      console.error('Sign out error', err);
    } finally {
      this.extAuthSub.next(null);
      this.authChangeSub.next(false);
      this.currentUserSub.next(null);
      localStorage.removeItem('session_user');
      this.router.navigate(['/auth/login']);
    }
  }

  public async handleExternalLogin(su: SocialUser): Promise<void> {
    if (!su.email) {
      await this.router.navigate(['/auth/login']);
      return;
    }

    try {
      // Llamar al mock backend (simula POST /api/auth/google/verify)
      const response = await this.mockBackend.verifyGoogleToken(
        su.email,
        su.id,
        su.name,
        su.photoUrl
      );

      if (response.isNew) {
        // Usuario nuevo → guardar temporal y redirigir a selección de rol
        const provisionalUser: AuthUser = {
          id: su.id,
          email: su.email,
          name: su.name,
          picture: su.photoUrl,
          roles: ['user'],
          isRegistered: false
        };
        this.store.upset(provisionalUser);
        this.setSession(provisionalUser);
        await this.router.navigate(['/auth/select-rol']);
      } else {
        // Usuario existente → iniciar sesión
        this.setSession(response.user!);
        this.redirectByRole(response.user!.roles);
      }
    } catch (error) {
      console.error('Login error', error);
      await this.router.navigate(['/auth/login']);
    }
  }

  public async setRole(role: UserRole): Promise<void> {
    const user = this.currentUserSub.value;
    if (!user) return;

    try {
      // Llamar al mock backend (simula POST /api/auth/complete-registration)
      const response = await this.mockBackend.completeRegistration(
        user.email,
        user.id.toString(),
        user.name,
        user.picture || '',
        role
      );

      this.setSession(response.user);
      this.redirectByRole(response.user.roles);
    } catch (error) {
      console.error('Registration error', error);
    }
  }

  public hasRole(role: UserRole): boolean {
    return this.currentUserSub.value?.roles.includes(role) ?? false;
  }

  public isAuthenticated(): boolean {
    return !!this.currentUserSub.value;
  }

  private redirectByRole(roles: UserRole[]): void {
    if (roles.includes('organizador')) {
      this.router.navigate(['/admin'])
    } else {
      this.router.navigate(['/']);
    }
  }

  private setSession(user: AuthUser) {
    this.currentUserSub.next(user);
    localStorage.setItem('session_user', JSON.stringify(user));
    this.authChangeSub.next(true);
  }

  private loadUserFromStore(): AuthUser | null {
    return JSON.parse(localStorage.getItem('session_user') || 'null');
  }
}
