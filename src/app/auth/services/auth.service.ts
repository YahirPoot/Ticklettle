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
      map(resp => this.handleAuthSuccess(resp)),
    )
  }

  registerOrganizer(organizerRequest: RegisterRequest): Observable<boolean> {
    return this.http.post<LoginResponse>(`${apiBaseUrl}/Auth/register/organizer`, 
      organizerRequest
    ).pipe(
      map(resp => this.handleAuthSuccess(resp)),
    )
  }

  googleLogin(payload: { email: string; firstName: string; lastName: string; googleToken: string; }): Observable<boolean> {
    return this.http.post<any>(`${apiBaseUrl}/Auth/google-login`, payload).pipe(
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

        // caso: backend indica que el usuario no existe y hay que completar registro
        // guardamos provisionalmente los datos para completar el registro en el flujo UI
        if (resp?.isNew) {
          const provisional = {
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName,
            googleToken: payload.googleToken
          };
          try { localStorage.setItem('provisional_social', JSON.stringify(provisional)); } catch {}
          // navegar a selección/registro de rol; el componente de UI leerá provisional_social
          this.router.navigate(['/auth/select-rol']);
          return false;
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
    const user = sessionStorage.getItem('user');
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
    const user: User = login.user;
    this._user.set(user);
    this._token.set(login.token);
    this._authStatus.set('authenticated');
    sessionStorage.setItem('user', JSON.stringify(user));

    if (login.token) {
      localStorage.setItem('token', login.token);
    }
    if (login.expiration) {
      localStorage.setItem('token-expiration', login.expiration);
    }

    return true;
  }

  private handleAuthError( error: any ) {
      console.log(error)
      this.clearSession();
      return of(false);
    }

  private clearSession() {
    this._user.set(null);
    this._authStatus.set('not-authenticated');
    localStorage.clear()
    sessionStorage.clear();
  }

}
