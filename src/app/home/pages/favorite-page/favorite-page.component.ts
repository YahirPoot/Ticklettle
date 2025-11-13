import { Component, computed, inject, resource } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../auth/services/auth.service';
import { IsNotAuthenticatedComponent } from '../../../shared/components/is-not-authenticated/is-not-authenticated.component';
import { FavoriteEventService } from '../../../event/services/favorite-event.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-favorite-page',
  imports: [MatIconModule, IsNotAuthenticatedComponent, RouterLink],
  templateUrl: './favorite-page.component.html',
})
export class FavoritePageComponent { 
  authService = inject(AuthService);
  private favoriteEventSvc = inject(FavoriteEventService);

  isAuthenticated = computed(() => this.authService.authStatus() === 'authenticated');

  favoritesResource = resource({
    loader: () => this.favoriteEventSvc.list(),
  });

  get favorites() {
    return this.favoritesResource.value() || [];
  }

  deleteFavorite(eventId: number) {
    this.favoriteEventSvc.delete(eventId);
    this.favoritesResource.reload();
  }
}
