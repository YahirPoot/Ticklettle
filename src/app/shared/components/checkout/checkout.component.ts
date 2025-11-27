import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { PaymentService } from '../../services/payment.service';
import { loadStripe, Stripe, StripeElements, PaymentMethodResult } from '@stripe/stripe-js';
import { CheckoutService } from '../../services/checkout.service';
import { environment } from '../../../../environments/environment.dev';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit, OnDestroy { 
  private fb = inject(FormBuilder);
  private router = inject(Router);

  private paymentService = inject(PaymentService);
  private checkoutService = inject(CheckoutService);
  
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  card: any = null;

  clientSecret: string | null = null;
  paymentIntentId: string | null = null;

  loading = signal(false);
  error = signal<string | null>(null);

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
      this.error.set('No payment data found.'); 
      return;
    }

    this.stripe = await loadStripe(environment.stripeApiKey);
    
    if (!this.stripe) {
      this.error.set('Failed to load Stripe.');
      return;
    }

    try {
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
    }
    catch (err) {
      console.error('Error creating payment intent:', err);
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
    this.card.on('change', (e: any) => this.error.set(e.error ? e.error.message : null));
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

  async pay() {
    if (!this.stripe || !this.card || !this.paymentIntentId || !this.clientSecret) return;
    this.loading.set(true);
    this.error.set(null);

    const name = this.paymentForm.value.name || 'Guest';
    const email = this.paymentForm.value.email || '';

    try {
      console.log('[checkout] creando PaymentMethod...');
      const pmResult: PaymentMethodResult = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.card,
        billing_details: { name: name, email: email }
      });

      console.log('[checkout] pmResult:', pmResult);
      if (pmResult.error) {
        this.error.set(pmResult.error.message || 'Error creando método de pago.');
        this.loading.set(false);
        return;
      }

      const paymentMethodId = pmResult.paymentMethod?.id;
      if (!paymentMethodId) {
        this.error.set('No se creó el método de pago.');
        this.loading.set(false);
        return;
      }   

      console.log('[checkout] enviando paymentMethodId al backend...');
      const confirmRes: any = await firstValueFrom(this.paymentService.confirmPayment({
        paymentIntentId: this.paymentIntentId,
        paymentMethodId
      }));

      console.log('confirmRes', confirmRes);

      const status = confirmRes?.status || confirmRes?.paymentIntent?.status;
      if (status === 'completed') {
        // pago completado: redirige o muestra éxito
        console.log('Pago completado', confirmRes);
        this.router.navigate([`tickets/success-payment/${confirmRes.saleId}`]);
      } else {
        console.log('Estado paymentIntent:', confirmRes);
        this.error.set('Estado de pago inesperado.');
      }
    } catch (err: any) {
      console.error(err);
      this.error.set(err?.message || 'Error en el proceso de pago.');
    } finally {
      this.loading.set(false);
    }
  }
}
