import { Component, computed, inject, resource, signal } from '@angular/core';
import { ZonesInterface } from '../../../shared/interfaces';
import { EventService } from '../../../event/services/event.service';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { AuthService } from '../../../auth/services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-buy-ticket-page',
  imports: [ReactiveFormsModule],
  templateUrl: './buy-ticket-page.component.html',
})
export class BuyTicketPageComponent {
  private eventService = inject(EventService);
  private activatedRoute = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);
  authService = inject(AuthService);

  private fb = inject(FormBuilder);

  isAuthenticated = computed(() => this.authService.authStatus() === 'authenticated');

  private eventId: number = this.activatedRoute.snapshot.params['eventId'];

  formBuyTicket = this.fb.group({
    zoneId: [null as number | null, [Validators.required]], 
    tickets: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
  })

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

  get selectedZoneValue(): ZonesInterface | null {
    const id = this.formBuyTicket.get('zoneId')?.value ?? null;
    return this.zones.find(z => z.id === id) ?? null;
  }

  get selectedTicketsValue() {
    return this.formBuyTicket.get('tickets')?.value ?? 1;
  }
  
  get unitPrice(): number {
    return this.selectedZoneValue?.price ?? 1;
  }

  get totalPrice() {
    if (!this.selectedZoneValue) {
      return 0;
    }
    return this.unitPrice * this.selectedTicketsValue;
  }

  constructor() {
    this.formBuyTicket.get('zoneId')?.valueChanges.subscribe(() => {  
      this.formBuyTicket.get('tickets')?.setValue(1, { emitEvent: false });
    });
  }

  selectZone(zone: ZonesInterface) {
    this.formBuyTicket.get('zoneId')?.setValue(zone.id);
  }

  increaseTickets() {
    const currentTicket = this.formBuyTicket.get('tickets')?.value;
    this.formBuyTicket.get('tickets')?.setValue(Math.min(5, currentTicket! + 1));
  }

  decreaseTickets() {
    const currentTicket = this.formBuyTicket.get('tickets')?.value;
    this.formBuyTicket.get('tickets')?.setValue(Math.max(1, currentTicket! - 1));
  }

  onSubmit() {
    if (this.isAuthenticated()) {
      this.notificationService.showNotification('Debes iniciar sesión para comprar boletos.', 'warning');
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
    const zone = this.selectedZoneValue;
    const qTickets = this.selectedTicketsValue;

    if (!zone || qTickets <= 0) {
      this.notificationService.showNotification('Por favor, selecciona una zona y cantidad de boletos válidos.', 'warning');
      return;
    }

    const user = this.authService.user();

    const playload = {
      eventId: this.eventId,
      zoneId: zone.id,
      userId: user?.id,
      userEmail: user?.email,
      zoneName: zone.name,
      quantityTickets: qTickets,
      totalPrice: this.totalPrice,
      eventName: this.event?.title,
    }

    // Aqui iría la lógica para procesar la compra, como llamar a un servicio
    // que maneje la transacción y la generación de los boletos.
    console.log('Procesando compra con el siguiente detalle:', playload);
    // this.notificationService.showNotification('Compra realizada con éxito.', 'success');
    // this.formBuyTicket.reset();

  }
}
