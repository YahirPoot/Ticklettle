// ...existing code...
import { Component, computed, effect, inject, resource, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProductService } from '../../../product/services/product.service';
import { PaginationService } from '../../../shared/services/pagination.service';
import { ProfileService } from '../../../profile/services/profile.service';
import { ProductInterface } from '../../../product/interfaces/product.interface';
import { ProductFilter, ProductFilterRequest, ProductSpecialFilter } from '../../../product/interfaces';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
// ...existing imports...

@Component({
  selector: 'app-dash-sale-page',
  imports: [PaginationComponent],
  templateUrl: './dash-sale-page.component.html',
})
export class DashSalePageComponent { 
  private productService = inject(ProductService);
  paginationService = inject(PaginationService);
  private profileService = inject(ProfileService);


  // guardamos el organizerId ya resuelto en una signal
  organizerId = signal<number | null>(null);
  sales = signal<ProductInterface[]>([])
  isLoading = signal(false);
  error = signal<string | null>(null);

  filters = signal<ProductFilterRequest>({
    page: 1,
    pageSize: this.paginationService.pageSize(),
    search: undefined,
    sortBy: undefined,
    sortDesc: false,
    filter: {} as ProductFilter,
    specialFilter: {} as ProductSpecialFilter

  })

  constructor() {
    // resolver el perfil y establecer organizerId
    this.loadOrganizerAndProducts()
  }

  private reloadProductsEffect = effect(() => {
    const page = this.paginationService.page();
    const org = this.organizerId();

    this.loadProducts(page);
  })

  private async loadOrganizerAndStart() {
    try {
      const user = firstValueFrom(this.profileService.getProfileUser());
      this.organizerId.set((await user)?.organizerId ?? 0);
    } catch (err) {
      console.error('Failed to load profile user', err);
      this.organizerId.set(0);
    }
  }


  private async initOrganizerId() {
    try {
      const user = await firstValueFrom(this.profileService.getProfileUser());
      this.organizerId.set(user?.organizerId ?? 0);
    } catch (err) {
      console.error('Failed to load profile user', err);
      this.organizerId.set(0);
    }
  }

  loadProducts(page: number) {
    this.isLoading.set(true);

    const filter: ProductFilterRequest = {
      page: page,
      pageSize: this.paginationService.pageSize(),
      search: "",
      sortBy: "",
      sortDesc: false, 
      filter: {
        name: "",
        description: "",
        eventId: [],
        minPrice: 0,
        maxPrice: 0,
      } as ProductFilter,
      specialFilter: {
        isPopular: false, 
        isFree: false, 
        isWatched: false,
      } as ProductSpecialFilter
    };

    const orgId = this.organizerId();
    if (!orgId) {
      console.warn('No organizerId available yet');
      this.isLoading.set(false);
      return;
    }

    this.productService.getProductsByOrganizer(orgId, page, this.paginationService.pageSize())
      .subscribe({
        next: (res: any) => {
          // ajustar según la forma real de la respuesta
          this.sales.set(res.items ?? res);

          this.paginationService.totalPages.set(res.totalPages ?? 1);
          this.paginationService.pageSize.set(res.totalItems ?? this.sales().length);

          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading products', err);
          this.isLoading.set(false);
        }
      });
  }

  private async loadOrganizerAndProducts() {
    await this.initOrganizerId();
    this.loadProducts(this.paginationService.page());
  }

  onPageChange(newPage: number) {
    this.paginationService.setPage(newPage);
  }
}
