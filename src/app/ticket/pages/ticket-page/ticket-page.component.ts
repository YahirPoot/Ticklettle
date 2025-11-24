import { Component, computed, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../auth/services/auth.service';
import { IsNotAuthenticatedComponent } from '../../../shared/components/is-not-authenticated/is-not-authenticated.component';
import { TicketService } from '../../services/ticket.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-ticket-page',
  imports: [IsNotAuthenticatedComponent, RouterLink, MatIconModule],
  templateUrl: './ticket-page.component.html',
})
export class TicketPageComponent { 
  authService = inject(AuthService);
  private ticketService = inject(TicketService);

  isAuthenticated = computed(() => this.authService.authStatus() === 'authenticated');

  ticketsResource = resource({
    loader: () => firstValueFrom(this.ticketService.getTicketsByAttendee()),
  })

  get allTickets() {
    return this.ticketsResource.value() || [];
  }

}

