import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ticket-page',
  imports: [MatIconModule, CommonModule, RouterLink],
  templateUrl: './ticket-page.html',
})
export class TicketPage {
   activeTickets = [
    { id:1, organizer: 'Casa Organizadora', ticketType: 'Boleto Acceso VIP', icon: 'wallet' },
    { id: 2, organizer: 'Casa Organizadora', ticketType: 'Boleto Acceso VIP', icon: 'wallet' },
  ];

  expiredTransferredTickets = [
    { id: 3, organizer: 'Casa Organizadora', ticketType: 'Boleto Acceso VIP', icon: 'wallet' },
    { id: 4, organizer: 'Casa Organizadora', ticketType: 'Boleto Acceso VIP', icon: 'wallet' },
  ]; }
