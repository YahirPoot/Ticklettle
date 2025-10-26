import { Component, computed, inject, resource, signal } from '@angular/core';
import { ZonesInterface } from '../../../shared/interfaces';
import { EventService } from '../../../event/services/event.service';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-buy-ticket-page',
  imports: [],
  templateUrl: './buy-ticket-page.component.html',
})
export class BuyTicketPageComponent {
  private eventService = inject(EventService);
  private activatedRoute = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);
  authService = inject(AuthService);

  isAuthenticated = computed(() => this.authService.authStatus() === 'authenticated');

  private eventId: number = this.activatedRoute.snapshot.params['eventId'];

  selectedZoneId = signal<ZonesInterface | null>(null);
  selectedTickets = signal<number>(1);

  eventResource = resource({
    loader: () => this.eventService.byId(this.eventId),
  });

  get event() {
    return this.eventResource.value();
  }

  zones: ZonesInterface[] = [
    { id: 1,  name: 'Zona Platinum', type: 'Adulto', price: 2500 },
    { id: 2, name: 'Zona Oro', type: 'Adulto', price: 2000 },
    { id: 3, name: 'Primer Nivel', type: 'Adulto', price: 1750 },
    { id: 4, name: 'Segundo Nivel', type: 'Adulto', price: 1500 },
  ]

  get selectedZoneValue() {
    return this.selectedZoneId();
  }

  get selectedTicketsValue() {
    return this.selectedTickets();
  }
  
  get unitPrice() {
    return (this.selectedZoneValue?.price ?? 0);
  }

  get totalPrice() {
    if (!this.selectedZoneValue) {
      return 0;
    }
    return this.unitPrice * this.selectedTickets();
  }

  selectZone(zone: ZonesInterface) {
    this.selectedZoneId.set(zone);
  }

  increaseTickets() {
    this.selectedTickets.update(v => Math.min(5, v + 1));
  }

  decreaseTickets() {
    this.selectedTickets.update(v => Math.max(1, v - 1));
  }

  buyTickets() {
    if (!this.isAuthenticated()) {
      this.notificationService.showNotification('Debes iniciar sesión para comprar boletos.', 'warning');
      return;
    }

    if (!this.selectedZoneValue) {
      return;
    }

    console.log(
      'Comprar', {
        eventId: this.eventId,
        event: this.event,
        zone: this.selectedZoneValue, 
        tickes: this.selectedTicketsValue,
        total: this.totalPrice
      }
    )
  }
}
