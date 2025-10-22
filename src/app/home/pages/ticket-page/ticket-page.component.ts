import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common'; // Necesario para el uso de @for

@Component({
  selector: 'app-ticket-page',
  standalone: true, // Si es un componente standalone
  imports: [MatIconModule, CommonModule],
  templateUrl: './ticket-page.component.html',
})
export class TicketPageComponent {
  // Datos estáticos para simular los boletos
  activeTickets = [
    { organizer: 'Casa Organizadora', ticketType: 'Boleto Acceso VIP', icon: 'wallet' },
    { organizer: 'Casa Organizadora', ticketType: 'Boleto Acceso VIP', icon: 'wallet' },
  ];

  expiredTransferredTickets = [
    { organizer: 'Casa Organizadora', ticketType: 'Boleto Acceso VIP', icon: 'wallet' },
    { organizer: 'Casa Organizadora', ticketType: 'Boleto Acceso VIP', icon: 'wallet' },
  ];
}