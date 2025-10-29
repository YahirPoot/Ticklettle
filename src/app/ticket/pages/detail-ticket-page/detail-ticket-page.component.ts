import { Component, inject, resource } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TicketService } from '../../services/ticket.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detail-ticket-page',
  imports: [MatIconModule],
  templateUrl: './detail-ticket-page.component.html',
})
export class DetailTicketPageComponent { 
  private ticketService = inject(TicketService);
  private activatedRoute = inject(ActivatedRoute);

  ticketId: number = this.activatedRoute.snapshot.params['ticketId'];

  ticketResource = resource({
    loader: () => this.ticketService.byId(this.ticketId),
  });

  get ticketDetails() {
    return this.ticketResource.value();
  }
  // ticketDetails = {
  //   organizer: 'Casa Organizadora',
  //   type: 'Acceso Zona Platinum',
  //   dateAndTime: 'Fecha y Hora', // Esto podría ser '2025-10-13 23:00'
  //   location: 'Ubicación', // Esto podría ser 'Auditorio Central'
  //   qrPlaceholder: 'https://placehold.co/256x256/ffffff/000000?text=QR', // Placeholder para el QR
  // };
}
