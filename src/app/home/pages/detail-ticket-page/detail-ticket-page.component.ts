import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail-ticket-page',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './detail-ticket-page.component.html',
})
export class DetailTicketPageComponent {
  // Datos del boleto para usar en el template
  ticketDetails = {
    organizer: 'Casa Organizadora',
    type: 'Acceso Zona Platinum',
    dateAndTime: 'Fecha y Hora', // Esto podría ser '2025-10-13 23:00'
    location: 'Ubicación', // Esto podría ser 'Auditorio Central'
    qrPlaceholder: 'https://placehold.co/256x256/ffffff/000000?text=QR', // Placeholder para el QR
  };
}