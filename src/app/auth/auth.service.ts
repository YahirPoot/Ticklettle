import { inject, Injectable } from '@angular/core';
import { SocialAuthService, SocialUser } from "@abacritt/angularx-social-login";
import { GoogleLoginProvider } from "@abacritt/angularx-social-login";
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private socialAuthService = inject(SocialAuthService);

  private authChangeSub = new Subject<boolean>();
  private extAuthSub = new Subject<SocialUser | null>();

  public authChanged = this.authChangeSub.asObservable();
  public externalAuthChanged = this.extAuthSub.asObservable();

  constructor() {
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
    }
  }
}
