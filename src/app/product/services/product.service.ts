import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.dev';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { ProductInterface } from '../../event/interfaces';

const apiBaseUrl = environment.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private htpp = inject(HttpClient);

  getProductsByOrganizer() {
    return this.htpp.get<ProductInterface[]>(`${apiBaseUrl}/Products/organizer`
    ).pipe(
      tap(res => console.log('Products by organizer:', res)),
    );
  }
}
