import { Component, computed, inject, OnDestroy, OnInit, resource, signal } from '@angular/core';
import { ZonesInterface } from '../../../shared/interfaces';
import { EventService } from '../../../event/services/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { AuthService } from '../../../auth/services/auth.service';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckoutService } from '../../../shared/services/checkout.service';
import { HeaderBackComponent } from '../../../shared/components/header-back/header-back.component';
import { firstValueFrom, lastValueFrom, Subscription } from 'rxjs';
import { TicketService } from '../../services/ticket.service';
import { OrderRequest } from '../../interfaces';

@Component({
  selector: 'app-buy-ticket-page',
  imports: [ReactiveFormsModule, HeaderBackComponent],
  templateUrl: './buy-ticket-page.component.html',
})
export class BuyTicketPageComponent {
  private activatedRoute = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private readonly router = inject(Router);

  private eventService = inject(EventService);
  private notificationService = inject(NotificationService);
  private checkoutService = inject(CheckoutService);
  authService = inject(AuthService);
  private ticketService = inject(TicketService);
  private sseSub?: Subscription;

  loading = signal(false);

  zones: ZonesInterface[] = [
    { id: 1,  name: 'Zona Platinum', type: 'Adulto', price: 2500 },
    { id: 2, name: 'Zona Oro', type: 'Adulto', price: 2000 },
    { id: 3, name: 'Primer Nivel', type: 'Adulto', price: 1750 },
    { id: 4, name: 'Segundo Nivel', type: 'Adulto', price: 1500 },
  ]

  isAuthenticated = computed(() => this.authService.authStatus() === 'authenticated');

  private eventId: number = this.activatedRoute.snapshot.params['eventId'];
  
    eventResource = resource({
      loader: () =>  firstValueFrom(this.eventService.getEventById(this.eventId)),
    });
  
    get event() {
      return this.eventResource.value();
    }

  formBuyTicket = this.fb.group({
    quantities: this.fb.array(this.zones.map(() => this.fb.control(0, [Validators.min(0), Validators.max(5)]))),
  });

  get quantities(): FormArray {
    return this.formBuyTicket.get('quantities') as FormArray;
  }

  qtyAt(i: number) {
    return this.quantities.at(i).value ?? 0;
  } 
  
  totalTickets() {
    return this.quantities.controls.reduce((sum, control) =>  sum + (control.value ?? 0), 0);
  }
  
  totalPrice() {
    return this.zones.reduce((sum, zone, index) =>  sum + zone.price * (this.qtyAt(index) ?? 0), 0);
  }

  canIncrease(i: number) {
    return this.totalTickets() < 5;
  }

  increase(i: number) {
    if (!this.canIncrease(i)) {
      return;
    }
    const control = this.quantities.at(i);
    control.setValue(Math.min(5, (control.value || 0) + 1));
  }
  
  decrease(i: number) {
    const  control = this.quantities.at(i);
    control.setValue(Math.max(0, (control.value || 0) - 1));
  }
  
  toggleZone(index: number) {
    const current = this.qtyAt(index);
    if (current === 0) {
      if (this.totalTickets() >= 5) return;
      this.quantities.at(index).setValue(1);
    } else {
      this.quantities.at(index).setValue(0);
    }
  }
  
  totalTicketsForZone(index: number) {
    const qty = this.qtyAt(index);
    const price = this.zones[index].price;
    return qty * price;
  }

  selectedIndexs() {
    return this.quantities.controls
    .map((control, index) => ({index, v: control.value ?? 0}))
      .filter(it => it.v > 0)
      .map(it => it.index);
    }

  removeZone(index: number) {
    return this.quantities.at(index).setValue(0);
  }

  async onSubmit() {
    // if (!this.isAuthenticated()) {
    //   this.notificationService.showNotification('Debes iniciar sesión para comprar boletos.', 'warning');
    //   return;
    // }
    
    const items = this.zones
    .map((zone, index) => ({
        title: zone.name,
        unitPrice: zone.price,
        unit_amount: zone.price,
        quantity: this.qtyAt(index),
      })).filter(it => it.quantity > 0);
      
      if (items.length === 0) {
        this.notificationService.showNotification('Debes seleccionar al menos un boleto para continuar.', 'warning');
        return;
    }
    
    const orderPayload: OrderRequest = {
      eventId: this.eventId,
      items, 
      buyer: {
        userId: this.authService.user()?.id,
        email: this.authService.user()?.email,
        nameUser: this.authService.user()?.firstName
      },
      total: this.totalPrice(),
      totalTickets: this.totalTickets(),
    }
    
    this.loading.set(true);
    try {
      
      const order = await lastValueFrom(this.ticketService.createOrder(orderPayload));
      this.checkoutService.onProceedToPay(items, order.id);
    } catch (error) {
      console.error('error', error);
      this.notificationService.showNotification('Error al crear la orden o iniciar checkout.', 'error');
      this.loading.set(false);
    }
  }
  
  goBack() {
    this.router.navigate(['/detail-event', this.eventId], { relativeTo: this.activatedRoute });
  }

}
