import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProductRequest, UpdateEventRequest } from '../interfaces';
import { ProductService } from '../../product/services/product.service';
import { UploadImageUseCase } from '../../shared/use-cases/upload-image-use-case';


@Injectable({ providedIn: 'root' })
export class EventUpdateFacadeService {
  private uploadImageUseCase = inject(UploadImageUseCase);
  private productService = inject(ProductService);

  /**
   * Prepara el UpdateEventRequest a partir del form value y archivos.
   * - sube imágenes de productos en batch (si hay)
   * - crea productos nuevos vía ProductService.createProductByEvent
   * - construye arrays de products y ticketTypes
   */
  async prepareUpdateRequest(params: {
    formValue: any;
    productFiles: Record<number, File | null>;
    mainImageFile?: File | null;
    mainImageUrl?: string | null;
    eventId: number;
  }): Promise<{ request: UpdateEventRequest; createdProducts: ProductRequest[] }> {
    const { formValue, productFiles, mainImageFile, mainImageUrl, eventId } = params;

    // Fecha/hora
    const datePart = formValue.date ?? '';
    const timePart = (formValue.time && formValue.time.length >= 5) ? formValue.time : '00:00';
    const dateTime = `${datePart}T${timePart}`;

    // subir imagen principal si se proporcionó un File y no hay URL
    let imageUrl = mainImageUrl ?? '';
    if (!imageUrl && mainImageFile) {
      try {
        imageUrl = await this.uploadImageUseCase.execute(mainImageFile, 1);
      } catch (err) {
        console.warn('Main image upload failed in facade:', err);
      }
    }

    // productos
    const productsForm = (formValue.products ?? []) as any[];
    const nProducts = productsForm.length;
    const filesToUpload: (File | null | undefined)[] = new Array(nProducts).fill(null).map((_, i) => productFiles[i] ?? null);

    let uploadedUrls: (string | '')[] = new Array(nProducts).fill('');
    try {
      if (filesToUpload.some(f => !!f)) {
        uploadedUrls = await this.uploadImageUseCase.uploadAll(filesToUpload, 4, 1);
      }
    } catch (err) {
      console.warn('Error uploading product images in facade:', err);
      // seguir adelante con las URLs vacías
    }

    const productsPayload: ProductRequest[] = [];
    const createdProducts: ProductRequest[] = [];

    for (let i = 0; i < nProducts; i++) {
      const v = productsForm[i] ?? {};
      const uploaded = uploadedUrls[i];
      const imageForProduct = uploaded || v.imageUrl || undefined;

      if (!v.productId) {
        const shouldCreate = (v.name ?? '').trim() !== '' || (v.price ?? 0) > 0 || (v.stock ?? 0) > 0 || !!imageForProduct;
        if (shouldCreate) {
          const newReq: any = {
            name: v.name,
            description: v.description,
            price: v.price,
            stock: v.stock,
            imageUrl: imageForProduct
          };
          try {
            const created = await firstValueFrom(this.productService.createProductByEvent(eventId, newReq));
            if (created) createdProducts.push(created as ProductRequest);
          } catch (err) {
            console.error('Error creating product in facade:', err);
            // no abortar completamente; informar en componente
          }
        }
        continue;
      }

      const productReq: ProductRequest = {
        productId: v.productId,
        name: v.name,
        description: v.description,
        price: v.price,
        stock: v.stock,
      };
      if (imageForProduct) productReq.imageUrl = imageForProduct;
      productsPayload.push(productReq);
    }

    // añadir los creados al final
    for (const cp of createdProducts) {
      productsPayload.push({
        productId: (cp as any).productId,
        name: (cp as any).name,
        description: (cp as any).description,
        price: (cp as any).price,
        stock: (cp as any).stock,
        imageUrl: (cp as any).imageUrl
      });
    }

    // ticketTypes
    const ticketTypesPayload = (formValue.ticketTypes ?? []).map((t: any) => {
      const out: any = {
        name: t.name,
        description: t.description,
        price: t.price,
        availableQuantity: t.availableQuantity
      };
      if (t.ticketTypeId) out.ticketTypeId = t.ticketTypeId;
      return out;
    });

    const request: UpdateEventRequest = {
      name: formValue.name ?? '',
      description: formValue.description ?? '',
      dateTime,
      location: formValue.location ?? '',
      type: formValue.type ?? '',
      status: formValue.status ?? '',
      imageUrl: imageUrl ?? '',
      ticketTypes: ticketTypesPayload,
      products: productsPayload
    };

    return { request, createdProducts };
  }
}
