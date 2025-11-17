import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../../environments/environment.dev';
import { RegisterRequest, UserRole } from '../../interfaces';
import { LoadingModalService } from '../../../shared/services/loading-modal.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { first } from 'rxjs';

const googleClientId = environment.googleClientId;
declare global {
  interface Window { google?: any; }
}

@Component({
  selector: 'app-register-page',
  imports: [RouterLink, ReactiveFormsModule, LoadingComponent],
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent implements OnInit, OnDestroy { 
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute)
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private loadingService = inject(LoadingModalService);

  role: 0 | 1 = 0; // 0: asistente, 1: organizador

  // Se agrega control del rol y cmapos extra para el rol del organizadorez
  registerForm = this.fb.group({
    role: [0],
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    // campos organizador
    company: [''],
    taxId: [''],
    fiscalAddress: [''],
    organizingHouseName: [''],
    organizingHouseAddress: [''],
    organizingHouseContact: [''],
    organizingHouseTaxData: [''],
    // campos asistente
    dateOfBirth: [null],
    gender: [''],
    photoUrl: [''],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  private clientId = googleClientId;
  private mounted = false;

  ngOnInit(): void {
    this.initGsi();

    this.activatedRoute.queryParams.subscribe(q => {
      const role = Number(q['role']);
      if (role === 1 || role === 0) {
        this.role = role as 0|1;
        this.registerForm.get('role')?.setValue(this.role);
        return;
      }
      const pr = localStorage.getItem('provisional_role');
      if (pr !== null) {
        const nr = Number(pr);
        this.role = nr === 1 ? 1 : 0;
        this.registerForm.get('role')?.setValue(this.role);
      }
    });

    const socialRaw = sessionStorage.getItem('social_user') || localStorage.getItem('provisional_social');
    if (socialRaw) {
      try {
        const p = JSON.parse(socialRaw);
        this.registerForm.patchValue({
          email: p.email ?? '',
          firstName: p.firstName ?? '',
          lastName: p.lastName ?? '',
          photoUrl: p.photoUrl ?? ''
        });
      } catch {}
    } 

    this.registerForm.get('role')?.valueChanges.subscribe((v) => {
        this.updateRoleValidators();
      });
      this.updateRoleValidators();
  }

  ngOnDestroy(): void {
    try {
      window.google.accounts.id.cancel();
    } catch {}
    this.mounted = false;
  }

  private updateRoleValidators() {
    const role = Number(this.registerForm.get('role')?.value) as 0 | 1;
    if (role === 1) {
      // organizador: requerir algunos campos opcionales según tu API
      this.registerForm.get('company')?.setValidators([ Validators.minLength(2)]);
      this.registerForm.get('taxId')?.setValidators([ Validators.minLength(6)]);
      // limpiar campos de asistente si aplica
      this.registerForm.get('dateOfBirth')?.clearValidators();
      this.registerForm.get('gender')?.clearValidators();
    } else {
      // asistente: requerir fecha/género si lo deseas
      // this.registerForm.get('dateOfBirth')?.setValidators();
      // this.registerForm.get('gender')?.setValidators([Va]);
      this.registerForm.get('company')?.clearValidators();
      this.registerForm.get('taxId')?.clearValidators();
    }
    ['company','taxId','dateOfBirth','gender','email','password','firstName','lastName'].forEach(field => {
      this.registerForm.get(field as any)?.updateValueAndValidity();
    });
  }

  public verifyPasswords(): boolean {
    // trigger validator
    this.registerForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    const mismatch = !!this.registerForm.errors?.['passwordMismatch'];
    // also check confirmPassword touched state to show messages
    const cpCtrl = this.registerForm.get('confirmPassword');
    if (cpCtrl && !cpCtrl.touched) cpCtrl.markAsTouched();
    return !mismatch;
  }

  // Getter simple para usar en template
  public get passwordMismatch() {
    return !!this.registerForm.errors?.['passwordMismatch']
      || (this.registerForm.get('confirmPassword')?.touched && this.registerForm.get('password')?.value !== this.registerForm.get('confirmPassword')?.value);
  }
  setRole(r: UserRole) {
    // this.registerForm.get('role')?.setValue(r);
    this.role = r;
    this.registerForm.get('role')?.setValue(r);
    this.updateRoleValidators();
  }

  get isOrganizer() {
    return Number(this.registerForm.get('role')?.value) === 1;
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
      firstName: payload.given_name ?? payload.name ?? '',
      lastName: payload.family_name ?? '',
      photoUrl: payload.picture ?? '',
      idToken: response.credential,
      provider: 'GOOGLE'
    };

    this.loadingService.showModal('create', 'Cargando información de Google...');
    sessionStorage.setItem('social_user', JSON.stringify(socialUser));
    localStorage.setItem('provisional_social', JSON.stringify(socialUser));
    this.router.navigateByUrl('/auth/select-rol');
    
  }

  onSubmit() {
      // if (this.registerForm.invalid) {
      //   this.registerForm.markAllAsTouched();
      //   return;
      // } 

    this.loadingService.showModal('create', 'Creando cuenta...');
    const role = Number(this.registerForm.get('role')?.value) as 0 | 1;
    let socialToken: string | undefined;
    const raw = sessionStorage.getItem('social_user') || localStorage.getItem('provisional_social');
    if (raw) {
      socialToken = JSON.parse(raw).idToken;
    }
    // normalize dateOfBirth: send ISO string when present, otherwise null
    const rawDob = this.registerForm.get('dateOfBirth')?.value;
    let dobIso: string | null = null;
    if (rawDob) {
      const d = new Date(rawDob);
      dobIso = isNaN(d.getTime()) ? null : d.toISOString();
    }

    const payloadAttendee: RegisterRequest = {
      email: this.registerForm.get('email')?.value!,
      firstName: this.registerForm.get('firstName')?.value!,
      lastName: this.registerForm.get('lastName')?.value!,
      password: this.registerForm.get('password')?.value!,
      dateOfBirth: dobIso,
      gender: this.registerForm.get('gender')?.value ?? '',
      photoUrl: this.registerForm.get('photoUrl')?.value ?? '',
      // ensure backend always receives a string (empty when not provided)
      googleToken: socialToken ?? '',
      // explicit boolean
      isGoogleRegistration: Boolean(socialToken)
    };

    console.log('payloadAttendee', payloadAttendee);

    const payloadOrganizer: RegisterRequest = {
      email: this.registerForm.get('email')?.value!,
      firstName: this.registerForm.get('firstName')?.value!,
      lastName: this.registerForm.get('lastName')?.value!,
      password: this.registerForm.get('password')?.value!,
      photoUrl: this.registerForm.get('photoUrl')?.value ?? '',
      company: this.registerForm.get('company')?.value ?? '',
      taxId: this.registerForm.get('taxId')?.value ?? '',
      fiscalAddress: this.registerForm.get('fiscalAddress')?.value ?? '',
      organizingHouseName: this.registerForm.get('organizingHouseName')?.value ?? '',
      organizingHouseAddress: this.registerForm.get('organizingHouseAddress')?.value ?? '',
      organizingHouseContact: this.registerForm.get('organizingHouseContact')?.value ?? '',
      organizingHouseTaxData: this.registerForm.get('organizingHouseTaxData')?.value ?? '',
      googleToken: socialToken,
      isGoogleRegistration: !!socialToken
    };

    if (role === 1) {
      console.log('Registering organizer with payload:', payloadOrganizer);
      this.authService.registerOrganizer(payloadOrganizer).subscribe({
        next: ok => {
          if (ok) {
            localStorage.removeItem('provisional_social');
            localStorage.removeItem('provisional_role');
            localStorage.removeItem('social_user');
            this.loadingService.hideModalImmediately()
            this.router.navigate(['/auth/callback']);
          }
        },
        error: err => console.error('Error registrar organizer', err)
      });
      return;
    }

    this.authService.registerAttendee(payloadAttendee).subscribe({
      next: ok => {
        if (ok) {
          localStorage.removeItem('provisional_social');
          localStorage.removeItem('provisional_role');
          this.loadingService.hideModalImmediately()
          this.router.navigate(['/auth/callback']);
        }
      },
      error: err => {
        console.error('Error registrar attendee', err);
        try {
          console.error('server error body:', err?.error ?? err);
        } catch (e) {}
      }
    });
  }
}
