import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../../environments/environment.dev';
import { RegisterRequest, UserRole } from '../../interfaces';

const googleClientId = environment.googleClientId;
declare global {
  interface Window { google?: any; }
}

@Component({
  selector: 'app-register-page',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent implements OnInit, OnDestroy { 
  private readonly router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // Se agrega control del rol y cmapos extra para el rol del organizadorez
  registerForm = this.fb.group({
    role: ['asistente', Validators.required],
    // Camopos para el 'asistente'
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]], 
    // Campos para organizador
    razonSocial: [''],
    rfc: [''],
    telefono: [''],
    isRegistered: [false],
    photoUrl: [''],

    confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  private clientId = googleClientId;
  private mounted = false;

  ngOnInit(): void {
    this.initGsi();

    this.registerForm.get('role')?.valueChanges.subscribe(() => {
      this.updateRoleValidators();
    });
    this.updateRoleValidators();
    this.registerForm.setValidators(this.passwordsMatchValidator);
  }

  ngOnDestroy(): void {
    try {
      window.google.accounts.id.cancel();
    } catch {}
    this.mounted = false;
  }

  private updateRoleValidators() {
    const role = this.registerForm.get('role')?.value;
    if (role === 'organizador') {
      this.registerForm.get('razonSocial')?.setValidators([Validators.minLength(2)]);
      this.registerForm.get('rfc')?.setValidators([Validators.minLength(12)]);
      this.registerForm.get('telefono')?.setValidators([Validators.minLength(10)]);
      this.registerForm.get('name')?.clearValidators();
    } else {
      this.registerForm.get('name')?.setValidators([Validators.required, Validators.minLength(2)]);
      this.registerForm.get('razonSocial')?.clearValidators();
      this.registerForm.get('rfc')?.clearValidators();
      this.registerForm.get('telefono')?.clearValidators();
    }
    ['name', 'razonSocial', 'rfc', 'telefono', 'email', 'password'].forEach(field => {
      this.registerForm.get(field)?.updateValueAndValidity();
    });
  }

  private passwordsMatchValidator(control: AbstractControl) {
    const pw = control.get('password')?.value;
    const cpw = control.get('confirmPassword')?.value;

    return pw && cpw && pw === cpw ? null : { passwordMismatch: true };
  }

  setRole(r: UserRole) {
    this.registerForm.get('role')?.setValue(r);
  }

  get isOrganizer() {
    return this.registerForm.get('role')?.value === 'organizador';
  }

  private initGsi() {
    const tryInit = () => {
      if (!window.google || !window.google.accounts || !window.google.accounts.id) {
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

      const container = document.getElementById('g_id_signin');
      if (container) {
        window.google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular'
        });
      }
    };
    
    tryInit();
  }

  private handleCredentialResponse(response: { credential?: string }) {
    if (!response.credential) return;

    const payload = JSON.parse(atob(response.credential.split('.')[1]));

    const socialUser = {
      id: payload.sub, 
      email: payload.email,
      name: payload.name,
      idToken: response.credential,
      // photoUrl: payload.picture,
      provider: 'GOOGLE'
    };

    localStorage.setItem('social_user', JSON.stringify(socialUser));

    this.authService.handleExternalLogin(socialUser).then(() => {
      this.router.navigate(['/auth/callback']);
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;


    const role: UserRole = this.registerForm.get('role')?.value as UserRole;
    const email = this.registerForm.get('email')?.value ?? '' ;
    const password = this.registerForm.get('password')?.value ?? '';

    let payload: RegisterRequest
    if (role === 'organizador') {
      payload = {
        role,
        email,
        password,
        razonSocial: this.registerForm.get('razonSocial')?.value ?? '',
        rfc: this.registerForm.get('rfc')?.value ?? '',
        telefono: this.registerForm.get('telefono')?.value ?? ''
      }
    } else {
      payload = {
        role, 
        email, 
        password, 
        name: this.registerForm.get('name')?.value ?? ''
      }
    }
    console.log('Register con', payload);
    // localStorage.setItem('user_data', JSON.stringify(payload));

    this.authService.register(payload).subscribe({
      next: (isAuthenticated) => {
        if (isAuthenticated) {
          this.router.navigate(['/auth/callback']);
        } else {
          console.error('Registro fallido');
        }
      },
      error: (err) => {
        console.error('Error al registrar', err);
      },
      complete: () => {
        // this.isSubmitting = false;
      }
    });
  }
}
