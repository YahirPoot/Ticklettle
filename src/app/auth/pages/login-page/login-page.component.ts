import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment.dev';
import { AuthService } from '../../services/auth.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { LoadingModalService } from '../../../shared/services/loading-modal.service';

declare global {
  interface Window { google?: any; }
}

const googleClientId = environment.googleClientId;

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, LoadingComponent],
  templateUrl: './login-page.component.html'
})
export class LoginPageComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private loadingService = inject(LoadingModalService);

  showError = signal(false);
  
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  
  private clientId = googleClientId;
  private mounted = false;

  ngOnInit(): void {
    this.initGsi();
  }

  
  ngOnDestroy(): void {
    // deshabilitar selección automática si fue habilitada
    try { window.google?.accounts?.id?.cancel(); } catch {}
    this.mounted = false;
  }

  private initGsi() {
    // espera a que el script GSI cargue
    const tryInit = () => {
      if (!window.google || !window.google.accounts || !window.google.accounts.id) {
        // reintentar en 100ms hasta que esté disponible
        setTimeout(tryInit, 100);
        return;
      }

      if (this.mounted) return;
      this.mounted = true;

      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response: any) => this.handleCredentialResponse(response),
        auto_select: false
      });

      // renderizar botón en el contenedor
      const container = document.getElementById('g_id_signin');
      if (container) {
        window.google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          type: 'standard'
        });
      }
    };

    tryInit();
  }

  private handleCredentialResponse(response: { credential?: string }) {
    if (!response.credential) return;

      // credential es un JWT; decodificar payload
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      // ejemplo de objeto a guardar
      const socialUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        photoUrl: payload.picture,
        idToken: response.credential
      };

      

      this.authService.googleLogin(socialUser.idToken).subscribe((loggedIn) => {
        if (loggedIn) {
          this.router.navigateByUrl('/auth/callback')
        }
      });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.showError.set(true);
      setTimeout(() => {
        this.showError.set(false);
      }, 4000);
      return;
    }

    const { email = '', password = '' } = this.loginForm.value;
    console.log('Login con', { email, password });

    this.loadingService.showModal('create', 'Iniciando sesión...');

    this.authService.login(email!, password!).subscribe((isAuthenticated) => {
      this.loadingService.hideModalImmediately();
      if (isAuthenticated) {
        this.router.navigateByUrl('/auth/callback');
        return;
      }
      this.loadingService.hideModalImmediately();
    this.showError.set(true);
      setTimeout(() => {
        this.showError.set(false);
        
      }, 4000);
    });
  }
}