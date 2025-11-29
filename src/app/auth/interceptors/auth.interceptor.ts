import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const auth = inject(AuthService);
  let token: string | null = null;

  // soporta distintos shapes: método getToken(), signal token() o propiedad token
  if (typeof (auth as any).getToken === 'function') {
    token = (auth as any).getToken();
  } else if (typeof (auth as any).token === 'function') {
    // token como signal
    try { token = (auth as any).token(); } catch { token = null; }
  } else {
    token = (auth as any).token ?? null;
  }

  // si ya existe Authorization no tocar
  if (!token || req.headers.has('Authorization')) {
    return next(req);
  }

  const cloned = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });
  return next(cloned);
}