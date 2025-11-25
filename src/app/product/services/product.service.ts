import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.dev';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ProductRequest } from '../interfaces';
import { ProductInterface } from '../interfaces/product.interface';

const apiBaseUrl = environment.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  getProductsByOrganizer() {
    return this.http.get<ProductInterface[]>(`${apiBaseUrl}/Products/organizer`
    ).pipe(
      tap(res => console.log('Products by organizer:', res)),
    );
  }

  createProductByEvent(eventId: number, requestProduct: ProductRequest): Observable<ProductRequest> {
    return this.http.post<ProductRequest>(`${apiBaseUrl}/Products/event/${eventId}`, requestProduct)
      .pipe(
        tap(response => console.log('Product created:', response))
      ) ;
  }
}
