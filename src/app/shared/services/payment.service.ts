import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.dev';
import { RequestPaymentInterface } from '../interfaces';
import { catchError, Observable, pipe, tap } from 'rxjs';
import { ResponsePaymentInterface } from '../interfaces/response-payment.interface';

const apiBaseUrl = environment.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);

  createPaymentIntent(requestPayment: RequestPaymentInterface) {
    return this.http.post<{ paymentIntentId: string, clientSecret: string, paymentId: number }>(`${apiBaseUrl}/Payments/create-payment-intent`, requestPayment)
      .pipe(
        tap(response => console.log('Payment Intent creado:', response))
      );
  }

  confirmPayment(payload: { paymentIntentId: string; paymentMethodId: string }): Observable<ResponsePaymentInterface> {
    return this.http.post<ResponsePaymentInterface>(`${apiBaseUrl}/Payments/confirm-payment`, payload)
      .pipe(
        tap(response => console.log('Payment confirmado:', response)),
        catchError(err => {
          console.error('Error al confirmar el pago:', err);
          throw err;
        })
      );
  }

  cancelPaymentIntent(paymentIntentId: string): Observable<void> {
    return this.http.delete<void>(`${apiBaseUrl}/Payments/cancel-payment-intent`, 
      {
        body: { paymentIntentId }
      }
    ).pipe(
      tap(() => console.log('Payment Intent cancelado:', paymentIntentId)),
      catchError(err => {
        console.error('Error al cancelar el Payment Intent:', err);
        throw err;
      })
    )
  }

  deletePaymentId(payementId: number): Observable<void> {
    return this.http.delete<void>(`${apiBaseUrl}/Payments/${payementId}`)
      .pipe(
        tap(() => console.log('Pago eliminado:', payementId)),
        catchError(err => {
          console.error('Error al eliminar el pago:', err);
          throw err;
        })
      )    
  }

  getSaleById(saleId: number): Observable<ResponsePaymentInterface> {
    return this.http.get<ResponsePaymentInterface>(`${apiBaseUrl}/Payments/sales/${saleId}`
      ).pipe(
        tap(response => console.log('Detalles de la venta obtenidos:', response))
      )
  }
}
