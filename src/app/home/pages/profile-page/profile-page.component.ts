import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { IsNotAuthenticated } from '../../../shared/components/is-not-authenticated/is-not-authenticated';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [MatIconModule, RouterLink, IsNotAuthenticated],
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent {

  private authService = inject(AuthService);  

  isAuthenticated = computed(() => this.authService.authStatus() === 'authenticated');
  user = computed(() => this.authService.user());

}
