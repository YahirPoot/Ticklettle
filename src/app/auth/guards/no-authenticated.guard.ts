import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const noAuthenticatedGuard: CanMatchFn = async (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = await firstValueFrom(authService.checkStatus());


  const role = authService.user()?.customRole;

  if (role == (1)) {
    router.navigate(['/admin/dashboard']);
    return false;
  } else if (role == 0) {
    router.navigateByUrl('/');
    return false;

  }
  return true;
};
