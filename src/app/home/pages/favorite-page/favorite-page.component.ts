import { Component, computed, inject, resource, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../auth/services/auth.service';
import { IsNotAuthenticatedComponent } from '../../../shared/components/is-not-authenticated/is-not-authenticated.component';
import { FavoriteEventService } from '../../../event/services/favorite-event.service';
import { RouterLink } from '@angular/router';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { EventCardComponent } from '../../../event/components/event-card/event-card.component';

@Component({
  selector: 'app-favorite-page',
  standalone: true,
  imports: [
    MatIconModule,
    IsNotAuthenticatedComponent,
    RouterLink,
    ConfirmModalComponent, // ⬅️ IMPORTANTE
    EventCardComponent,
  ],
  templateUrl: './favorite-page.component.html',
})
export class FavoritePageComponent {

  authService = inject(AuthService);
  private favoriteEventSvc = inject(FavoriteEventService);

  showConfirm = signal(false);
  showSuccess = signal(false);
  selectedToDelete = signal<number | null>(null);
  selectedName = signal<string | null>(null);

  isAuthenticated = computed(() =>
    this.authService.authStatus() === 'authenticated'
  );

  favoritesResource = resource({
    loader: () => this.favoriteEventSvc.list(),
  });

  get favorites() {
    return this.favoritesResource.value() || [];
  }

  openConfirm(eventId: number, name?: string) {
    this.selectedToDelete.set(eventId);
    this.selectedName.set(name ?? null);
    this.showConfirm.set(true);
  }

  cancelConfirm() {
    this.selectedToDelete.set(null);
    this.selectedName.set(null);
    this.showConfirm.set(false);
  }

  confirmDelete() {
    const id = this.selectedToDelete();
    if (id == null) return;

    try {
      this.favoriteEventSvc.delete(id);
    } finally {
      this.favoritesResource.reload();
      this.showConfirm.set(false);
      this.showSuccess.set(true);

      setTimeout(() => this.showSuccess.set(false), 3000);
    }
  }
}