import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'shared-not-found-page',
  imports: [],
  templateUrl: './not-found-page.component.html',
})
export class NotFoundPageComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  user = computed(() =>  this.authService.user());

  goBack() {
    if (this.user()?.roles.includes('organizador')) {
      this.router.navigate(['/admin/dashboard']);
      return;
    } else {
      this.router.navigate(['/']);
    }
  }
}
