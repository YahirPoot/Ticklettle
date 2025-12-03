import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.dev';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ProductFilterRequest, ProductRequest } from '../interfaces';
import { ProductInterface } from '../interfaces/product.interface';

const apiBaseUrl = environment.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  getProductsByOrganizer(organizerId: number, requestFilter: ProductFilterRequest): Observable<{ items: ProductInterface[], totalItems: number }> {
    return this.http.post<{ items: ProductInterface[], totalItems: number }>(`${apiBaseUrl}/Products/organizer/${organizerId}`, requestFilter);
  }

  createProductByEvent(eventId: number, requestProduct: ProductRequest): Observable<ProductRequest> {
    return this.http.post<ProductRequest>(`${apiBaseUrl}/Products/event/${eventId}`, requestProduct)
      .pipe(
        tap(response => console.log('Product created:', response))
      ) ;
  }

  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${apiBaseUrl}/Products/${productId}`);
  }
}
