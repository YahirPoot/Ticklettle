import { Component, computed, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../auth/services/auth.service';
import { IsNotAuthenticatedComponent } from '../../../shared/components/is-not-authenticated/is-not-authenticated.component';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-ticket-page',
  imports: [IsNotAuthenticatedComponent, RouterLink, MatIconModule],
  templateUrl: './ticket-page.component.html',
})
export class TicketPageComponent { 
  authService = inject(AuthService);
  private TicketService = inject(TicketService);

  isAuthenticated = computed(() => this.authService.authStatus() === 'authenticated');

  activeTicketsResource = resource({
    loader: () => this.TicketService.byStatus('active'),
  });

  expiredTicketsResource = resource({
    loader: () => this.TicketService.byStatus('expired'),
  });

  transferredTicketsResource = resource({
    loader: () => this.TicketService.byStatus('transferred'),
  });

  get activeTickets() {
    return this.activeTicketsResource.value() || [];
  }

  get expired_transferredTickets() {
    const expired = this.expiredTicketsResource.value() || [];
    const transferred = this.transferredTicketsResource.value() || [];
    return [...expired, ...transferred];
  }

}

