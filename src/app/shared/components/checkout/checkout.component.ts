import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { PaymentService } from '../../services/payment.service';
import { loadStripe, Stripe, StripeElements, PaymentMethodResult } from '@stripe/stripe-js';
import { CheckoutService } from '../../services/checkout.service';
import { environment } from '../../../../environments/environment.dev';
import { filter, firstValueFrom, Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { LoadingModalService } from '../../services/loading-modal.service';
import { LoadingComponent } from '../loading/loading.component';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { ResponsePaymentInterface } from '../../interfaces';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, DecimalPipe, LoadingComponent, ConfirmModalComponent, LoadingComponent],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit, OnDestroy { 
  private fb = inject(FormBuilder);
  private router = inject(Router);

  private paymentService = inject(PaymentService);
  private checkoutService = inject(CheckoutService);
  private loadingService = inject(LoadingModalService);
  private notificationService = inject(NotificationService)

  private navSub?: Subscription;
  
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  card: any = null;

  // Signal to know if Stripe Element has a complete card input
  cardComplete = signal(false);

  clientSecret: string | null = null;
  paymentIntentId: string | null = null;

  loading = signal(false);
  error = signal<string | null>(null);
  showConfirmCancel = signal(false);

  payload = this.checkoutService.getPayloadSnapshot();

  paymentForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]]
  })

  get total() {
    if (!this.payload?.items) return 0;
    return this.payload.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }

  async ngOnInit() {
    if (!this.payload) {
      const restored = this.checkoutService.refreshPayloadFromStorage();
      this.payload = restored ?? this.checkoutService.getPayloadSnapshot();
    }

    if (!this.payload) {
      this.error.set('No checkout payload found.');
      this.notificationService.showNotification('No se encontró información de pago. Regresa y vuelve a iniciar la compra.', 'error'); 
      return;
    }

    this.stripe = await loadStripe(environment.stripeApiKey);
    
    if (!this.stripe) {
      this.error.set('Failed to load Stripe.');
      this.notificationService.showNotification('No se pudo cargar el sistema de pagos. Intenta más tarde.', 'error');
      return;
    }

    const savedIntent = this.checkoutService.getSavedPaymentIntent();
    if (savedIntent) {
      this.clientSecret = savedIntent.clientSecret;
      this.paymentIntentId = savedIntent.paymentIntentId;
      console.log('Restored saved payment intent from storage:', savedIntent);
    }

    try {
      if (!this.clientSecret) {
        const req = {
          items: this.payload.items.map(item => ({
            type: item.type || 'ticket',
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            name: item.name
          })),
          eventId: this.payload.eventId,
          description: this.payload.description,
          currency: 'mxn',
          paymentMethodTypes: ['card']
        };
        const res = await firstValueFrom(this.paymentService.createPaymentIntent(req));
        this.clientSecret = res.clientSecret;
        this.paymentIntentId = res.paymentIntentId;
        console.log('Payment Intent creado:', res); 
        this.checkoutService.savePaymentIntent(this.clientSecret, this.paymentIntentId);
      }
    }
    catch (err) {
      console.error('Error creating payment intent:', err);
      this.notificationService.showNotification('Error al iniciar el proceso de pago. Intenta más tarde.', 'error');
      this.error.set('Failed to create payment intent.');
      return;
    }

    this.elements = this.stripe.elements();
    this.card = this.elements.create('card', { hidePostalCode: true, style: {
      base: {
        color: '#0f1720',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      }
    } } );
    this.card.mount('#card-element');
    // listen for changes to collect errors and know when the card is complete
    this.card.on('change', (e: any) => {
      this.error.set(e.error ? e.error.message : null);
      try {
        // e.complete is true when number+expiry+cvc are filled
        this.cardComplete.set(Boolean(e.complete));
      } catch {
        this.cardComplete.set(false);
      }
    });

    this.navSub = this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe((e: any) => {
      const targetUrl: string = e.url;
      // if navigating away from checkout, clear the payload to avoid stale state
      if (!targetUrl.startsWith('/tickets/checkout')) {
        this.checkoutService.clearPayload();
      }
    })
  }

  // mark all controls as touched so errors are shown to the user
  private markAllTouched() {
    try {
      Object.keys(this.paymentForm.controls).forEach(k => {
        const c = this.paymentForm.get(k);
        if (c) c.markAsTouched({ onlySelf: true });
      });
    } catch (err) {
      // ignore
    }
  }

  ngOnDestroy(): void { 
    this.card.destroy();
    try {
      if (this.card) {
        // some Stripe Element builds expose unmount/destroy, otras solo unmount
        if (typeof this.card.unmount === 'function') {
          try { this.card.unmount();
            this.card.destroy();
          } catch (e) { console.warn('card.unmount failed', e); }
        }
      }
      this.navSub?.unsubscribe();
    } catch (err) {
      console.warn('Error en ngOnDestroy checkout:', err);
    } finally {
      this.card = null;
      this.elements = null;
      this.clientSecret = null;
      this.paymentIntentId = null;
      this.loading.set(false);
      this.error.set(null);
    }
  }

  openCancelConfirm() {
    this.showConfirmCancel.set(true);
  }

  closeCancelConfirm() {
    this.showConfirmCancel.set(false);
  }

  async confirmCancel() {
    // ocultar modal inmediatamente
    this.showConfirmCancel.set(false);
    this.loading.set(true);
    try {
      // si quieres intentar cancelar el PaymentIntent en backend, descomenta y usa paymentService.cancelPaymentIntent
      if (this.paymentIntentId && typeof this.paymentService.cancelPaymentIntent === 'function') {
        await firstValueFrom(this.paymentService.cancelPaymentIntent(this.paymentIntentId));
        console.log('Payment Intent cancelado:', this.paymentIntentId);
      }

     const navigated = await this.router.navigate(['/']); // o la ruta que prefieras
      if (navigated) {
        // limpiar estado local y sessionStorage solo después de navegar
        this.checkoutService.clearPayload();
        this.notificationService.showNotification('Pago cancelado.', 'info');
      } else {
        // navegación fallida: no limpiar aún, mostrar mensaje
        this.notificationService.showNotification('No se pudo salir del proceso. Intenta de nuevo.', 'error');
      }
    } catch (err) {
      console.error('Error al cancelar pago:', err);
      this.notificationService.showNotification('No se pudo cancelar el pago. Intenta de nuevo.', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  async pay() {
    // Preconditions
    if (!this.stripe || !this.card || !this.paymentIntentId || !this.clientSecret) {
      this.error.set('No se pudo iniciar el proceso de pago. Intenta recargar la página.');
      return;
    }

    // validate form and card completeness
    if (this.paymentForm.invalid || !this.cardComplete()) {
      this.markAllTouched();
      this.error.set('Completa todos los campos de pago correctamente.');
      return;
    }

    // prevent double submit
    if (this.loading()) return;

    this.loading.set(true);
    this.error.set(null);
    this.loadingService.showModal('create', 'Procesando pago...');

    const name = this.paymentForm.value.name || 'Guest';
    const email = this.paymentForm.value.email || '';

    try {
      const pmResult: PaymentMethodResult = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.card,
        billing_details: { name: name, email: email }
      });

      if (pmResult.error) {
        const msg = pmResult.error.message || 'Error creando método de pago.';
        this.error.set(msg);
        this.notificationService.showNotification(msg, 'error');
        return;
      }

      const paymentMethodId = pmResult.paymentMethod?.id;
      if (!paymentMethodId) {
        this.error.set('No se creó el método de pago.');
        return;
      }

      const confirmPayload = { paymentIntentId: this.paymentIntentId, paymentMethodId };
      console.log('Confirming payment with payload:', confirmPayload);

      if (!this.paymentIntentId || !paymentMethodId) {
        this.error.set('Faltan datos para procesar el pago.');
        this.notificationService.showNotification('Faltan datos para procesar el pago.', 'error');
        return;
      }

      const confirmRes: ResponsePaymentInterface = await firstValueFrom(this.paymentService.confirmPayment(confirmPayload));
      console.log('Payment confirmation result:', confirmRes);

      const status = confirmRes?.status || confirmRes?.status;
      if (status === 'succeeded' || status === 'completed') {
        // éxito
        this.checkoutService.clearPayload();
        this.notificationService.showNotification('Pago realizado correctamente.', 'success');
        this.router.navigate([`tickets/success-payment/${confirmRes.saleId ?? ''}`]);
        return;
      }

      // estado inesperado
      const unexpected = 'El pago no se completó. Intenta nuevamente.';
      this.error.set(unexpected);
      this.notificationService.showNotification(unexpected, 'error');
      console.warn('Estado paymentIntent inesperado:', confirmRes);
      this.router.navigateByUrl('/tickets/error-payment');

    } catch (err: any) {
      console.error('[checkout] pay error', err);
      // Try to present a useful message to user
      const backendMsg = err?.error?.message ?? err?.message ?? null;
      const userMsg = backendMsg ? String(backendMsg) : 'Error al procesar el pago. Intenta de nuevo o contacta soporte.';
      this.error.set(userMsg);
      this.notificationService.showNotification(userMsg, 'error');
    } finally {
      // ensure modal and loading are hidden
      try { this.loadingService.hideModalImmediately(); } catch {}
      this.loading.set(false);
    }
  }
}
