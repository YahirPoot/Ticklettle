import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

declare global {
  interface Window { google?: any; }
}

@Component({
  selector: 'app-login-page',
  imports: [CommonModule],
  templateUrl: './login-page.component.html'
})
export class LoginPageComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private clientId = '735301633233-lepi10vlc9g1a7c8k0uvip7cfp9iba2t.apps.googleusercontent.com';
  private mounted = false;

  ngOnInit(): void {
    this.initGsi();
console.log('gsi clientId used:', this.clientId);
console.log('window.origin:', window.location.origin);
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

  // llamada opcional para mostrar prompt / One Tap
  public promptOneTap() {
    try {
      window.google?.accounts?.id?.prompt(); // muestra One Tap / consent
    } catch (err) {
      console.error('GSI prompt error', err);
    }
  }

  private handleCredentialResponse(response: { credential?: string }) {
    if (!response || !response.credential) {
      console.error('No credential from GSI', response);
      return;
    }

    try {
      // credential es un JWT; decodificar payload
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      // ejemplo de objeto a guardar
      const socialUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        idToken: response.credential
      };
      // guardar en localStorage (solo para pruebas)
      localStorage.setItem('socialUser', JSON.stringify(socialUser));
      console.log('GSI user', socialUser);

      // redirigir
      void this.router.navigate(['/']);
    } catch (err) {
      console.error('Error procesando credential JWT', err);
    }
  }
}