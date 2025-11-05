import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.dev';
import { loadStripe } from '@stripe/stripe-js';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private readonly http = inject(HttpClient);
  private readonly stripeUrl = environment.serverBackend;

  // envia items al backend y redirige al Checkout (usa session.url)
  onProceedToPay(items: any, orderId?: string) {
    this.http.post<{ url: string; id: string }>(`${this.stripeUrl}/checkout`, {
      items, orderId
    }).subscribe({
      next: (res) => {
        if (res?.url) {
          // redirige al Checkout que creó tu servidor
          window.location.href = res.url;
        } else {
          console.error('Checkout response missing url', res);
        }
      },
      error: (err) => {
        console.error('Error creating checkout session:', err);
      }
    });
  }
}
