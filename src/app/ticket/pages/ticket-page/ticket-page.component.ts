import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { IsNotAuthenticated } from '../../../shared/components/is-not-authenticated/is-not-authenticated';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ticket-page',
  imports: [IsNotAuthenticated, RouterLink, MatIconModule],
  templateUrl: './ticket-page.component.html',
})
export class TicketPageComponent { 
  authService = inject(AuthService);

  isAuthenticated = computed(() => this.authService.authStatus() === 'authenticated');

  activeTickets = [
    { id:1, organizer: 'Casa Organizadora', ticketType: 'Boleto Acceso VIP', icon: 'wallet' },
    { id: 2, organizer: 'Casa Organizadora', ticketType: 'Boleto Acceso VIP', icon: 'wallet' },
  ];

  expiredTransferredTickets = [
    { id: 3, organizer: 'Casa Organizadora', ticketType: 'Boleto Acceso VIP', icon: 'wallet' },
    { id: 4, organizer: 'Casa Organizadora', ticketType: 'Boleto Acceso VIP', icon: 'wallet' },
  ]; 
}

