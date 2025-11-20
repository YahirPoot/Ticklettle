import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../interfaces';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-select-rol',
  imports: [],
  templateUrl: './select-rol.component.html',
})
export class SelectRolComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private notificationSvc = inject(NotificationService);

  public async choose(role: 0 | 1) {
    const socialRaw = sessionStorage.getItem('social_user') || localStorage.getItem('provisional_social');
    if (!socialRaw) {
      localStorage.setItem('provisional_role', String(role));
      this.router.navigate(['/auth/register'], { queryParams: { role }});
      return;
    }

    let social: any;
    try { social = JSON.parse(socialRaw); } catch (e) { social = null; }

    if (!social) {
      localStorage.setItem('provisional_role', String(role));
      this.router.navigate(['/auth/register'], { queryParams: { role }});
      return;
    }

    // Si es ORGANIZADOR, redirigir al formulario para completar datos obligatorios
    if (role === 1) {
      localStorage.setItem('provisional_role', '1');
      // guarda social_user si quieres persistir entre páginas
      sessionStorage.setItem('social_user', JSON.stringify(social));
      this.router.navigate(['/auth/register'], { queryParams: { role: 1 }});
      return;
    }

    // Si es ASISTENTE, podemos intentar registrar directamente con los datos de Google
    const payloadAtt: RegisterRequest = {
      email: social.email,
      firstName: social.firstName ?? '',
      lastName: social.lastName ?? '',
      password: Math.random().toString(36).slice(-12),
      dateOfBirth: new Date().toISOString(),
      gender: '',
      photoUrl: social.photoUrl ?? '',
      googleToken: social.idToken || social.googleToken || '',
      isGoogleRegistration: true
    };

    this.authService.registerAttendee(payloadAtt).subscribe({
      next: ok => {
        if (ok) {
          localStorage.removeItem('provisional_social');
          localStorage.removeItem('provisional_role');
          sessionStorage.removeItem('social_user');
          this.router.navigateByUrl('/auth/callback');
        }
      },
      error: () => {
        this.notificationSvc.showNotification('No se pudo registrar con Google. Por favor, completa el formulario de registro.', 'error');
        localStorage.clear();
        sessionStorage.clear();
        this.router.navigate(['/auth/register'], { queryParams: { role: 0 }});
      }
    });
  }
}
