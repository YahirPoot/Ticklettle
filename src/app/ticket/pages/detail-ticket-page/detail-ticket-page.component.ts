import { Component, inject, OnInit, resource, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TicketService } from '../../services/ticket.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-detail-ticket-page',
  imports: [MatIconModule, DatePipe, QRCodeComponent, RouterLink, TitleCasePipe],
  templateUrl: './detail-ticket-page.component.html',
})
export class DetailTicketPageComponent { 
  private ticketService = inject(TicketService);
  private activatedRoute = inject(ActivatedRoute);

  // Signal para manejar el estado de carga al agregar a Google Wallet
  isAddingToWallet = signal(false);

  ticketId: number = this.activatedRoute.snapshot.params['ticketId'];

  ticketResource = resource({
    loader: () => firstValueFrom(this.ticketService.getTicketById(this.ticketId)),
  });

  get ticketDetails() {
    return this.ticketResource.value();
  }

  // Método para manejar la acción de agregar a Google Wallet
addToGoogleWallet(event?: MouseEvent) {
  const openInNewTab = !!(event && (event.ctrlKey || event.metaKey || event.shiftKey));
  this.isAddingToWallet.set(true);

  this.ticketService.getTicketShareUrl(this.ticketId)
    .subscribe({
      next: (res) => {
        console.log('URL recibida:', res);

        // Si la API NO devuelve enlace, mostrar error
        if (!res?.saveLink) {
          this.isAddingToWallet.set(false);
          alert('No se pudo generar el enlace de Google Wallet');
          return;
        }

        if (openInNewTab) {
            window.open(res.saveLink, '_blank', 'noopener');
          } else {
            window.location.href = res.saveLink;
          }
      },
      error: (err) => {
        console.error('Error obteniendo Wallet URL:', err);
        this.isAddingToWallet.set(false);
        alert('Hubo un error al agregar a Google Wallet.');
      }
    });
  }

  copyCode() {}
}

