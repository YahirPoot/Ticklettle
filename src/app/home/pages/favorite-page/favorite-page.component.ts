import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../auth/services/auth.service';
import { IsNotAuthenticatedComponent } from '../../../shared/components/is-not-authenticated/is-not-authenticated.component';

@Component({
  selector: 'app-favorite-page',
  imports: [MatIconModule, IsNotAuthenticatedComponent],
  templateUrl: './favorite-page.component.html',
})
export class FavoritePageComponent { 
  authService = inject(AuthService);

  isAuthenticated = computed(() => this.authService.authStatus() === 'authenticated');
}
