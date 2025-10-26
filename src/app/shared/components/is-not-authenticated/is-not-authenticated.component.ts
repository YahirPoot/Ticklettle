import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'shared-is-not-authenticated',
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="min-h-screen w-full flex items-center justify-center p-8">
        <div class="card bg-base-100 shadow-xl p-8 max-w-md w-full text-center">
            <h2 class="text-2xl font-bold mb-2">Inicia sesión</h2>
            <p class="text-gray-500 mb-6">{{ message() }}</p>
            <a [routerLink]="['', 'auth', '/login']" class="btn btn-neutral w-full">
                <mat-icon class="mr-2">login</mat-icon>
                Ir al login
            </a>
        </div>
    </div>
  `,
})
export class IsNotAuthenticatedComponent { 
  message = input<string>('');
}
