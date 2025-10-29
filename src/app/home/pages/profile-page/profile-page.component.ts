import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { RouterOutlet } from '@angular/router';
import { IsNotAuthenticatedComponent } from '../../../shared/components/is-not-authenticated/is-not-authenticated.component';

@Component({
  selector: 'app-profile-page',
  imports: [RouterOutlet, IsNotAuthenticatedComponent],
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent {

  private authService = inject(AuthService);  

  isAuthenticated = computed(() => this.authService.authStatus() === 'authenticated');
  user = computed(() => this.authService.user());

}
