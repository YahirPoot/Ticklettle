import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-google-auth-callback',
  imports: [],
  template: `
    <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
            <span class="loading loading-spinner loading-lg"></span>
            <p class="mt-3">Procesando inicio de sesión...</p>
        </div>
    </div>
  `,
})
export class GoogleAuthCallbackComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const raw = sessionStorage.getItem('user') || sessionStorage.getItem('social_user');
    if (!raw) {
      this.router.navigate(['/auth/login']);
      return;
    }
    const user = JSON.parse(raw);

    this.router.navigate(['/auth/select-rol']);
  }
}
