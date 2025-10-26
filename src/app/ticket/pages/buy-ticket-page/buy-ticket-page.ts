import { Component, computed, inject, resource, signal } from '@angular/core';
import { EventService } from '../../../event/services/event.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ZonesInterface } from '../../../shared/interfaces';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'buy-ticket-page',
  imports: [],
  templateUrl: './buy-ticket-page.html',
})
export class BuyTicketPage { 
  private eventService = inject(EventService);
  private activatedRoute = inject(ActivatedRoute);
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
      alert('Debes iniciar sesión para comprar boletos.');
      return;
    }

    if (!this.selectedZoneValue) {
      return;
    }

    alert(`Has comprado ${this.selectedTicketsValue} boletos en la zona ${this.selectedZoneValue.name} por un total de $${this.totalPrice}`);

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
