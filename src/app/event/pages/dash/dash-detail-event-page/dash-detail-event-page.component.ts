import { Component, inject, resource, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderBackComponent } from '../../../../shared/components/header-back/header-back.component';
import { EventService } from '../../../services/event.service';
import { DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoadingModalService } from '../../../../shared/services/loading-modal.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ProductRequest } from '../../../../product/interfaces';
import { ProductService } from '../../../../product/services/product.service';
import { UploadImageUseCase } from '../../../../shared/use-cases/upload-image-use-case';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-dash-detail-event-page',
  imports: [MatIconModule, HeaderBackComponent, 
    DatePipe, RouterLink, ReactiveFormsModule, 
    LoadingComponent, ConfirmModalComponent
  ],
  templateUrl: './dash-detail-event-page.component.html',
})  
export class DashDetailEventPageComponent { 
  private activedRoute = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private readonly router = inject(Router);

  private readonly eventService = inject(EventService);
  private readonly uploadImageUseCase = inject(UploadImageUseCase);
  private readonly productService = inject(ProductService);
  private readonly loadingModalService = inject(LoadingModalService);
  private readonly notificationService = inject(NotificationService);

  private readonly eventId: number = this.activedRoute.snapshot.params['eventId'];

  isOpenModalCreateProduct = signal(false);
  productImageFile = signal<File | null>(null);
  productImagePreview = signal<string | null>(null);
  isSubmit = signal(false);

  // Signals para confirmar la elimincación de un producto
  showConfirmDeleteProduct = signal(false);
  selectedProductToDelete = signal<number | null>(null);


  eventResource = resource({
    loader: () => {
        return  firstValueFrom(this.eventService.getEventById(this.eventId));
      }
  });

  productForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.maxLength(500)]],
    price: [0, [Validators.required, Validators.min(1)]],
    stock: [0, [Validators.required, Validators.min(1)]],
    imageUrl: ['']
  })

  get eventById() {
    return this.eventResource.value();
  }

  get productsByEvent() {
    return this.eventById?.products || [];
  }

  onSelectProductImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.productImageFile.set(file);

    const reader = new FileReader();
    reader.onload = () => this.productImagePreview.set(reader.result as string);
    reader.readAsDataURL(file);

  }

  onOpenModalProduct() {
    this.productForm.reset();
    this.productImagePreview.set(null);
    this.productImageFile.set(null);
    this.isSubmit.set(false);
    this.isOpenModalCreateProduct.set(true);
  }

  onCloseModalProduct() {
    this.isOpenModalCreateProduct.set(false);
  }

  async onSubmitProduct() {
    if (this.productForm.invalid) {
      this.notificationService.showNotification('Por favor, completa correctamente el formulario del producto.', 'error');
      return;
    }
    
    this.isSubmit.set(true);
    this.loadingModalService.showModal('create', 'Agregando producto...');

    let imageUrl = '';
    if (this.productImageFile()) {
      imageUrl = await this.uploadImageUseCase.execute(this.productImageFile()!);
    }

    const payload: ProductRequest = {
      name: this.productForm.value.name!,
      description: this.productForm.value.description || '',
      price: this.productForm.value.price!,
      stock: this.productForm.value.stock!,
      imageUrl: imageUrl
    };

    this.productService.createProductByEvent(this.eventId, payload).subscribe({
      next: () => {
        this.notificationService.showNotification('Producto agregado correctamente', 'success');
        this.isOpenModalCreateProduct.set(false);
        this.productImagePreview.set(null); 
        this.productImageFile.set(null);
        this.productForm.reset();
        this.eventResource.reload();
      },
      error: () => {
        this.notificationService.showNotification('Error al agregar el producto', 'error');
      },
      complete: () => {
        this.loadingModalService.hideModalImmediately();
        this.isSubmit.set(false);
      }
    });
  }

  goBack() {
    return this.router.navigate(['/admin/events'], { relativeTo: this.activedRoute });
  }

  openConfirmDeleteProduct(productId: number) {
    this.selectedProductToDelete.set(productId);
    this.showConfirmDeleteProduct.set(true);
  }

  cancelConfirmDeleteProduct() {
    this.selectedProductToDelete.set(null);
    this.showConfirmDeleteProduct.set(false);
  }

  private deleteProduct(productId: number) {
    
    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.notificationService.showNotification('Producto eliminado correctamente.', 'success');
        this.eventResource.reload();
        this.showConfirmDeleteProduct.set(false);
        this.selectedProductToDelete.set(null);
      },
      error: (err) => {
        console.error('Error eliminando producto', err);
        this.notificationService.showNotification('Error eliminando el producto. Intenta de nuevo más tarde.', 'error');
        this.showConfirmDeleteProduct.set(false);
        this.selectedProductToDelete.set(null);
      }
    })
  }

  confirmDeleteProduct() {
    const productId = this.selectedProductToDelete();
    if (productId == null) return;
    
    this.deleteProduct(productId);
  }
}
  