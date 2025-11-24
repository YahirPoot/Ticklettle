import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { RequestPaymentInterface } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private router = inject(Router);
  private _payload$ = new BehaviorSubject<RequestPaymentInterface | null>(null);
  payload$ = this._payload$.asObservable();

  onProceedToPayment(requestPayment: RequestPaymentInterface) {
    this._payload$.next(requestPayment);
    this.router.navigate(['/tickets/checkout']);
  }

  getPayloadSnapshot() {
    return this._payload$.getValue();
  }
  
}
