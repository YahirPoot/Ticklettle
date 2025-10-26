import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IsNotAuthenticated } from '../../../shared/components/is-not-authenticated/is-not-authenticated';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-favorite-page',
  imports: [MatIconModule, IsNotAuthenticated],
  templateUrl: './favorite-page.component.html',
})
export class FavoritePageComponent { 
  authService = inject(AuthService);

  isAuthenticated = computed(() => this.authService.authStatus() === 'authenticated');
}
