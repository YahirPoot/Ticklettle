import { Component, computed, inject, resource, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../auth/services/auth.service';
import { IsNotAuthenticatedComponent } from '../../../shared/components/is-not-authenticated/is-not-authenticated.component';
import { FavoriteEventService } from '../../../event/services/favorite-event.service';
import { RouterLink } from '@angular/router';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { EventCardComponent } from '../../../event/components/event-card/event-card.component';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../../../shared/services/notification.service';

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
  private notificationService = inject(NotificationService);

  showConfirm = signal(false);
  selectedToDelete = signal<number | null>(null);
  selectedName = signal<string | null>(null);

  isAuthenticated = computed(() =>
    this.authService.authStatus() === 'authenticated'
  );

  favoritesResource = resource({
    loader: () => firstValueFrom(this.favoriteEventSvc.getFavoriteEventsByAttendee()),
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

    this.favoriteEventSvc.removeFavoriteEvent(id).subscribe({
      next: () => {
        this.favoritesResource.reload();
        this.showConfirm.set(false);
        this.notificationService.showNotification('El evento fue eliminado de favoritos correctamente.', 'success');
      },
      error: () => {
        this.showConfirm.set(false);
        this.notificationService.showNotification('Failed to remove event from favorites.', 'error');
      }
    });
  }
}