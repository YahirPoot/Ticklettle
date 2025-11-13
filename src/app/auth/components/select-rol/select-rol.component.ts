import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-select-rol',
  imports: [],
  templateUrl: './select-rol.component.html',
})
export class SelectRolComponent {
  private readonly router = inject(Router);
  public async choose(role: 0 | 1) {
    localStorage.setItem('provisional_role', String(role));

    this.router.navigate(['/auth/register'], { queryParams: { role }});
  }
}
