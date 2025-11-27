import { DatePipe, NgClass } from '@angular/common';
import { Component, inject, OnInit, resource, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { firstValueFrom } from 'rxjs';
import { ResponsePaymentInterface } from '../../interfaces';

@Component({
  selector: 'app-payment-success',
  imports: [ DatePipe, RouterLink],
  templateUrl: './payment-success.component.html',
})
export class PaymentSuccessComponent { 
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private paymentService = inject(PaymentService);

  saleId: number = this.activatedRoute.snapshot.params['saleId'];

  getSaleResource = resource({
    loader: () => firstValueFrom(this.paymentService.getSaleById(this.saleId)),
  })



  get saleById() {
    return this.getSaleResource.value();
  }
  // objeto que recibes desde backend (sale/order)
  order = signal<ResponsePaymentInterface | null>(null);

  // si tu API devuelve montos en centavos pon true, sino false
  amountIsInCents = false;

  formatted(amount: number) {
    if (amount == null) return '—';
    const value = this.amountIsInCents ? (amount / 100) : amount;
    // Ajusta la moneda según tu proyecto
    return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  }

  viewOrder() {
    // navegar a detalle de la orden
    this.router.navigate(['/tickets']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
