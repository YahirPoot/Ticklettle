import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RequestPaymentInterface, Item } from '../../../shared/interfaces';
import { EventService } from '../../../event/services/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { AuthService } from '../../../auth/services/auth.service';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckoutService } from '../../../shared/services/checkout.service';
import { HeaderBackComponent } from '../../../shared/components/header-back/header-back.component';
import { firstValueFrom } from 'rxjs';
import { TicketService } from '../../services/ticket.service';
import { ClaimFreeTicketRequest, TypeTicketInterface } from '../../interfaces';
import { LoadingModalService } from '../../../shared/services/loading-modal.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-buy-ticket-page',
  imports: [HeaderBackComponent, ReactiveFormsModule, LoadingComponent],
  templateUrl: './buy-ticket-page.component.html',
})
export class BuyTicketPageComponent implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private eventService = inject(EventService);
  private notificationService = inject(NotificationService);
  private checkoutService = inject(CheckoutService);
  private ticketService = inject(TicketService);
  private loadingModalService = inject(LoadingModalService);

  authService = inject(AuthService);

  loading = signal(false);
  ticketTypes: TypeTicketInterface[] = [];
  event: any;

  isAuthenticated = computed(
    () => this.authService.authStatus() === 'authenticated'
  );

  private eventId = Number(this.activatedRoute.snapshot.params['eventId']);

  formBuyTicket = this.fb.group({
    quantities: this.fb.array([])
  });

  get quantities(): FormArray {
    return this.formBuyTicket.get('quantities') as FormArray;
  }

  /** Hacerlo público para que el template pueda usarlo */
  qty(index: number): number {
    return this.quantities.at(index)?.value ?? 0;
  }

  private setQty(index: number, value: number) {
    this.quantities.at(index).setValue(value);
  }

  get totalTickets(): number {
    return this.quantities.controls.reduce(
      (sum, c) => sum + (c.value ?? 0),
      0
    );
  }

  get totalPrice(): number {
    return this.ticketTypes.reduce(
      (sum, tt, i) => sum + (Number(tt.price) || 0) * this.qty(i),
      0
    );
  }

  get isFreeEvent(): boolean {
    return (this.event?.type ?? '') === 'Gratis';
  }

  selectedIndexes(): number[] {
    return this.quantities.controls
      .map((c, i) => ({ i, v: c.value ?? 0 }))
      .filter(x => x.v > 0)
      .map(x => x.i);
  }

  canIncrease(i: number): boolean {
    if (this.totalTickets >= 5) return false;

    const qty = this.qty(i);
    const available = this.ticketTypes[i]?.availableQuantity ?? 0;

    return qty < available;
  }

  increase(i: number) {
    if (!this.canIncrease(i)) return;
    this.setQty(i, this.qty(i) + 1);
  }

  decrease(i: number) {
    this.setQty(i, Math.max(0, this.qty(i) - 1));
  }

  toggleZone(i: number) {
    const current = this.qty(i);
    if (current === 0 && this.canIncrease(i)) {
      this.setQty(i, 1);
    } else {
      this.setQty(i, 0);
    }
  }

  /** Quitar zona */
  removeZone(i: number) {
    this.setQty(i, 0);
  }

  async ngOnInit() {
    this.loading.set(true);

    try {
      const evt = await firstValueFrom(this.eventService.getEventById(this.eventId));
      this.event = evt;
      this.ticketTypes = evt?.ticketTypes ?? [];

      const qtyControls = this.ticketTypes.map(() =>
        this.fb.control(0, [Validators.min(0), Validators.max(5)])
      );

      this.formBuyTicket.setControl('quantities', this.fb.array(qtyControls) as FormArray);

    } catch (err) {
      console.error(err);
      this.notificationService.showNotification('Error al cargar boletos.', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  async claimFreeTickes() {
    const selected = this.selectedIndexes();

    if (selected.length === 0) {
      this.notificationService.showNotification('Selecciona un boleto.', 'warning');
      return;
    }

    this.loading.set(true);
    this.loadingModalService.showModal('create', 'Reclamando boletos...');

    try {
      for (const index of selected) {
        const tt = this.ticketTypes[index];
        const qty = this.qty(index);

        const req: ClaimFreeTicketRequest = {
          ticketTypeId: tt.ticketTypeId,
          quantity: qty
        };
        await firstValueFrom(this.ticketService.claimFreetickets(req));
      }

      this.notificationService.showNotification('Boletos reclamados.', 'success');
    } finally {
      this.loading.set(false);
      this.loadingModalService.hideModalImmediately();
      this.notificationService.showNotification('Boletos reclamados.', 'success');
    }
  }

  async onSubmit() {
    const items: Item[] = this.ticketTypes
      .map((tt, i) => ({
        type: 'ticket',
        itemId: tt.ticketTypeId,
        quantity: this.qty(i),
        unitPrice: Number(tt.price) || 0,
        name: tt.name
      }))
      .filter(x => x.quantity > 0);

    if (items.length === 0) {
      this.notificationService.showNotification('Selecciona al menos un boleto.', 'warning');
      return;
    }

    this.loading.set(true);

    const req: RequestPaymentInterface = {
      items,
      eventId: this.eventId,
      description: `Compra de ${this.totalTickets} boletos para ${this.event?.name}`,
      currency: 'mxn',
      paymentMethodTypes: ['card']
    };

    try {
      this.checkoutService.onProceedToPayment(req);
    } catch (err) {
      console.error(err);
      this.notificationService.showNotification('Error al iniciar pago.', 'error');
      this.loading.set(false);
    }
  }

  goBack() {
    this.router.navigate(['/detail-event', this.eventId]);
  }
}
