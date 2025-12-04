import { computed, inject, Injectable, resource, signal } from '@angular/core';
import { SocialAuthService, SocialUser } from "@abacritt/angularx-social-login";
import { GoogleLoginProvider } from "@abacritt/angularx-social-login";
import { catchError, firstValueFrom, from, map, Observable, of, switchMap, tap } from 'rxjs';
// import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthUser, LoginResponse, RegisterRequest, User } from '../interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.dev';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
type UserRole = 0 | 1;
const apiBaseUrl = environment.apiBaseUrl;
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
  private http = inject(HttpClient);
  private socialAuthService = inject(SocialAuthService);
  private router = inject(Router);

  private _authStatus =  signal<AuthStatus>('checking');
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));

  checkStatusResource = resource({
    loader: () => firstValueFrom(this.checkStatus()),
  })

  authStatus = computed<AuthStatus>(() => {
    if (this._authStatus() === 'checking')  return 'checking';
    if (this._user()) {
      return 'authenticated';
    } 
    return 'not-authenticated';
  })

  user = computed(() => this._user());

  token = computed(() => this._token());


  login(email: string, password: string): Observable<boolean> {
    return this.http.post<LoginResponse>(`${apiBaseUrl}/Auth/login`, {
      email,
      password
    }).pipe(
      map(resp => this.handleAuthSuccess(resp)),
      catchError((err: any) => this.handleAuthError(err))
    )
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  registerAttendee(attendeeRequest: RegisterRequest): Observable<boolean> {
    return  this.http.post<LoginResponse>(`${apiBaseUrl}/Auth/register/attendee`,
      attendeeRequest
    ).pipe(
      map(resp => this.handleAuthSuccess(resp))
    )
  }

  registerOrganizer(organizerRequest: RegisterRequest): Observable<boolean> {
    return this.http.post<LoginResponse>(`${apiBaseUrl}/Auth/register/organizer`, 
      organizerRequest
    ).pipe(
      map(resp => this.handleAuthSuccess(resp))
    )
  }

  googleLogin(googleToken: string): Observable<boolean> {
    return this.http.post(`${apiBaseUrl}/Auth/google-login`, {googleToken}).pipe(
      map((resp: any) => {
        // caso éxito con token
        if (resp?.token && resp?.user) {
          // resp cumple LoginResponse
          this.handleAuthSuccess(resp as LoginResponse);
          // redirect según rol numérico (customRole)
          const role = (resp.user?.customRole ?? resp.user?.customRole);
          this.redirectByRole(role ?? undefined);
          return true;
        }
        // otros casos: fallback a error
        console.error('googleLogin: respuesta inesperada', resp);
        return false;
      }),
      catchError((err) => {
        console.error('googleLogin error', err);
        return of(false);
      })
    );
  }

  checkStatusAuthenticated(): Observable<boolean> {
    if (this._user()) return of(true);

    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const tokenExpiration = localStorage.getItem('token-expiration');
    if (user) {
      this._token.set(token);
      this.handleAuthSuccess({ user: JSON.parse(user) });
      // si existe token en storage, pásalo junto con el user para no sobrescribirlo
      const parsedUser = JSON.parse(user) as User;
      if (token || tokenExpiration) {
        this.handleAuthSuccess({ user: parsedUser, token: token ?? undefined, expiration: tokenExpiration ?? undefined });
      } else {
        this.handleAuthSuccess({ user: parsedUser });
      }
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

  // Cierra Sesión en Google usando la librería
  public signOutExternal(): Promise<void> {
    return this.socialAuthService.signOut();
  }

  public hasRole(role: UserRole): boolean {
    return this._user()?.customRole === role;
  }

  public isAuthenticated(): boolean {
    return !!this._user();
  }

  private redirectByRole(role: UserRole): void {
    if (role == 1) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  private handleAuthSuccess(resp: LoginResponse | {user: User}) {
    const login = resp as LoginResponse;
    const user = (login && login.user) ?? (resp as { user: User }).user;
    if (!user) return false;

    // solo actualizar token si viene en la respuesta (evitar sobrescribir con undefined)
    if ((login as LoginResponse).token) {
      const t = (login as any).token as string;
      this._token.set(t);
      try { localStorage.setItem('token', t); } catch {}
    }
    if ((login as LoginResponse).expiration) {
      try { localStorage.setItem('token-expiration', (login as LoginResponse).expiration); } catch {}
    }

    this._user.set(user);
    this._authStatus.set('authenticated');
    try { localStorage.setItem('user', JSON.stringify(user)); } catch {}
    return true;
  }

  private handleAuthError( error: any ) {
      this.clearSession();
      return of(false);
    }

  private clearSession() {
    this._user.set(null);
    this._authStatus.set('not-authenticated');
    localStorage.clear();
    sessionStorage.clear();
  }
}
