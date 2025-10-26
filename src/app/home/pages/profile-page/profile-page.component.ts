import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { IsNotAuthenticatedComponent } from '../../../shared/components/is-not-authenticated/is-not-authenticated.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [MatIconModule, RouterLink, IsNotAuthenticatedComponent],
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent {

  private authService = inject(AuthService);  

  isAuthenticated = computed(() => this.authService.authStatus() === 'authenticated');
  user = computed(() => this.authService.user());

}
