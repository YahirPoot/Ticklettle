import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../interfaces';

@Component({
  selector: 'app-select-rol',
  imports: [],
  templateUrl: './select-rol.component.html',
})
export class SelectRolComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  public async choose(role: 0 | 1) {
   // si no hay social_user -> guardar provisional_role y redirigir al formulario
    const socialRaw = sessionStorage.getItem('social_user') || localStorage.getItem('provisional_social');
    if (!socialRaw) {
      localStorage.setItem('provisional_role', String(role));
      this.router.navigate(['/auth/register'], { queryParams: { role }});
      return;
    }

    // intentar registrar directamente con los datos de Google
    let social: any;
    try { social = JSON.parse(socialRaw); } catch (e) { social = null; }

    if (!social) {
      localStorage.setItem('provisional_role', String(role));
      this.router.navigate(['/auth/register'], { queryParams: { role }});
      return;
    }

    // construir payload según rol
    if (role === 1) {
      const payload: RegisterRequest = {
        email: social.email,
        firstName: social.firstName ?? '',
        lastName: social.lastName ?? '',
        password: Math.random().toString(36).slice(-12),
        photoUrl: social.photoUrl ?? '',
        company: '',
        taxId: '',
        fiscalAddress: '',
        organizingHouseName: '',
        organizingHouseAddress: '',
        organizingHouseContact: '',
        organizingHouseTaxData: '',
        googleToken: social.idToken || social.googleToken || '',
        isGoogleRegistration: true
      };

      this.authService.registerOrganizer(payload).subscribe({
        next: ok => {
          if (ok) {
            localStorage.removeItem('provisional_social');
            localStorage.removeItem('provisional_role');
            sessionStorage.removeItem('social_user');
            this.router.navigateByUrl('/auth/callback');
          } else {
            // backend pide completar info -> guardar rol provisional y redirigir al form
            localStorage.setItem('provisional_role', String(role));
            this.router.navigate(['/auth/register'], { queryParams: { role }});
          }
        },
        error: () => {
          localStorage.setItem('provisional_role', String(role));
          this.router.navigate(['/auth/register'], { queryParams: { role }});
        }
      });
      return;
    } else {
      // role === 0 (attendee)
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
          } else {
            localStorage.setItem('provisional_role', String(role));
            this.router.navigate(['/auth/register'], { queryParams: { role }});
          }
        },
        error: () => {
          localStorage.setItem('provisional_role', String(role));
          this.router.navigate(['/auth/register'], { queryParams: { role }});
        }
      });
    }

  }
}
