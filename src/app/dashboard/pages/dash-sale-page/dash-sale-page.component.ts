import { Component, inject, resource } from '@angular/core';
import { ProductService } from '../../../product/services/product.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dash-sale-page',
  imports: [],
  templateUrl: './dash-sale-page.component.html',
})
export class DashSalePageComponent { 
  private productService = inject(ProductService);

  salesResource = resource({
    loader: () => firstValueFrom(this.productService.getProductsByOrganizer()),
  });

  get sales() {
    return this.salesResource.value() || [];
  }

  // sales =  [
  //   {
  //     imageUrl: 'https://img.freepik.com/psd-gratis/refrescante-bebida-cola-fria-vaso-salpicaduras_632498-25634.jpg?semt=ais_hybrid&w=740&q=80',
  //     name: 'Refrescante Bebida Cola',
  //     price:  20.00,
  //     stock: 50,
  //     sold: 200, 
  //     category: 'Bebidas'
  //   },
  //   {
  //     imageUrl: 'https://png.pngtree.com/png-vector/20210630/ourmid/pngtree-t-shirt-clothes-casual-shirt-png-image_3544180.jpg',
  //     name: 'Camiseta Oficial Evento',
  //     price:  150.00,
  //     stock: 70,
  //     sold: 50, 
  //     category: 'Ropa'
  //   },
  //   {
  //     imageUrl: 'https://img.freepik.com/psd-gratis/refrescante-bebida-cola-fria-vaso-salpicaduras_632498-25634.jpg?semt=ais_hybrid&w=740&q=80',
  //     name: 'Refrescante Bebida Cola',
  //     price:  20.00,
  //     stock: 50,
  //     sold: 200, 
  //     category: 'Bebidas'
  //   },
  //   {
  //     imageUrl: 'https://png.pngtree.com/png-vector/20210630/ourmid/pngtree-t-shirt-clothes-casual-shirt-png-image_3544180.jpg',
  //     name: 'Camisa Oficial Evento',
  //     price:  150.00,
  //     stock: 70,
  //     sold: 50, 
  //     category: 'Ropa'
  //   },
  // ]
}
