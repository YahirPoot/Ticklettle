import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { IsNotAuthenticated } from '../../../shared/components/is-not-authenticated/is-not-authenticated';

@Component({
  selector: 'app-ticket-page',
  imports: [MatIconModule, CommonModule, RouterLink, IsNotAuthenticated],
  templateUrl: './ticket-page.html',
})
export class TicketPage {
  authService = inject(AuthService);

  isAuthenticated = computed(() => this.authService.authStatus() === 'authenticated');

  activeTickets = [
    { id:1, organizer: 'Casa Organizadora', ticketType: 'Boleto Acceso VIP', icon: 'wallet' },
    { id: 2, organizer: 'Casa Organizadora', ticketType: 'Boleto Acceso VIP', icon: 'wallet' },
  ];

  expiredTransferredTickets = [
    { id: 3, organizer: 'Casa Organizadora', ticketType: 'Boleto Acceso VIP', icon: 'wallet' },
    { id: 4, organizer: 'Casa Organizadora', ticketType: 'Boleto Acceso VIP', icon: 'wallet' },
  ]; }
