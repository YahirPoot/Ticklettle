import { Component, inject, resource, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TicketService } from '../../services/ticket.service';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-detail-ticket-page',
  imports: [MatIconModule],
  templateUrl: './detail-ticket-page.component.html',
})
export class DetailTicketPageComponent { 
  private ticketService = inject(TicketService);
  private activatedRoute = inject(ActivatedRoute);

  // Signal para manejar el estado de carga al agregar a Google Wallet
  isAddingToWallet = signal(false);

  ticketId: number = this.activatedRoute.snapshot.params['ticketId'];

  ticketResource = resource({
    loader: () => firstValueFrom(this.ticketService.getTicketsByAttendee()).then(tickets => tickets.filter(ticket => ticket.ticketId === this.ticketId)[0]),
  });

  get ticketDetails() {
    return this.ticketResource.value();
  }

  // Método para manejar la acción de agregar a Google Wallet
  addToGoogleWallet() {
    this.isAddingToWallet.set(true);
  }
}
