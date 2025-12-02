import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { RequestPaymentInterface } from '../interfaces';

const STORAGE_KEY_PAYLOAD = 'checkout_payload_v1';
const STORAGE_KEY_INTENT = 'checkout_payment_intent_v1';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private router = inject(Router);
  private _payload$ = new BehaviorSubject<RequestPaymentInterface | null>(null);
  payload$ = this._payload$.asObservable();

  onProceedToPayment(requestPayment: RequestPaymentInterface) {
    try  {
      sessionStorage.setItem(STORAGE_KEY_PAYLOAD, JSON.stringify(requestPayment));
    } catch { console.log('Could not store payment payload in sessionStorage'); }
    this._payload$.next(requestPayment);
    this.router.navigate(['/tickets/checkout']);
  }

  getPayloadSnapshot() {
    return this._payload$.getValue();
  }
  
  refreshPayloadFromStorage(): RequestPaymentInterface | null {
    const current = this.getPayloadSnapshot();

    if (current) return current;

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_PAYLOAD);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as RequestPaymentInterface;
      this._payload$.next(parsed);
      return parsed;
    } catch {
      console.log('Could not parse payment payload from sessionStorage');
      return null;
    }
  }

  clearPayload() {
    sessionStorage.clear();
  }

  savePaymentIntent(clientSecret: string, paymentIntentId: string, paymentId: number) {
    try {
      sessionStorage.setItem(STORAGE_KEY_INTENT, JSON.stringify({ clientSecret, paymentIntentId, paymentId }));
    } catch { 
      console.log('Could not store payment intent in sessionStorage');
    }
  }

  getSavedPaymentIntent(): { clientSecret: string; paymentIntentId: string; paymentId: number } | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_INTENT);
      if (!raw) return null;
      return JSON.parse(raw) as { clientSecret: string; paymentIntentId: string; paymentId: number };
    } catch {
      console.log('Could not parse payment intent from sessionStorage');
      return null;
    }
  }
}
