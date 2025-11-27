import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.dev';
import { RequestPaymentInterface } from '../interfaces';
import { Observable, pipe, tap } from 'rxjs';
import { ResponsePaymentInterface } from '../interfaces/response-payment.interface';

const apiBaseUrl = environment.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);

  createPaymentIntent(requestPayment: RequestPaymentInterface) {
    return this.http.post<{ paymentIntentId: string, clientSecret: string }>(`${apiBaseUrl}/Payments/create-payment-intent`, requestPayment)
      .pipe(
        tap(response => console.log('Payment Intent creado:', response))
      );
  }

  confirmPayment(payload: { paymentIntentId: string; paymentMethodId: string }): Observable<ResponsePaymentInterface> {
    return this.http.post<ResponsePaymentInterface>(`${apiBaseUrl}/Payments/confirm-payment`, payload)
      .pipe(
        tap(response => console.log('Payment confirmado:', response))
      );
  }

  getSaleById(saleId: number): Observable<ResponsePaymentInterface> {
    return this.http.get<ResponsePaymentInterface>(`${apiBaseUrl}/Payments/sales/${saleId}`
      ).pipe(
        tap(response => console.log('Detalles de la venta obtenidos:', response))
      )
  }
}
