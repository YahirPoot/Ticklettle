import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../interfaces';

export function hasRoleGuard(role: UserRole): CanMatchFn {
    return () => {
      const authService = inject(AuthService);
      const router = inject(Router);
      if (!authService.isAuthenticated()) {
        return router.createUrlTree(['/auth/login']);
    }

    return authService.hasRole(role) ? true : router.createUrlTree(['/']);
  };
};
