import { DatePipe, NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  imports: [NgClass, DatePipe, RouterLink],
  templateUrl: './payment-success.component.html',
})
export class PaymentSuccessComponent implements OnInit{ 
  private router = inject(Router);

  // objeto que recibes desde backend (sale/order)
  order: any = null;

  // si tu API devuelve montos en centavos pon true, sino false
  amountIsInCents = false;

  ngOnInit(): void {
    const navState = (this.router as any).currentNavigation?.()?.extras?.state ?? null;
    this.order = navState?.order ?? history.state?.order ?? null;
    // fallback: si el backend devolvió la estructura que pegaste en el prompt,
    // podrías tenerla en history.state directamente.
  }

  formatted(amount: number) {
    if (amount == null) return '—';
    const value = this.amountIsInCents ? (amount / 100) : amount;
    // Ajusta la moneda según tu proyecto
    return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  }

  downloadTickets() {
    // implementar descarga / redirigir a boletos
    console.log('download tickets for order', this.order?.orderNumber);
  }

  viewOrder() {
    // navegar a detalle de la orden
    this.router.navigate(['/tickets']);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  contactSupport() {
    window.location.href = `mailto:soporte@tu-dominio.com?subject=Soporte pedido ${this.order?.orderNumber ?? ''}`;
  }
}
