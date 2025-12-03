import { Component, computed, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProductService } from '../../../product/services/product.service';
import { PaginationService } from '../../../shared/services/pagination.service';
import { ProfileService } from '../../../profile/services/profile.service';
import { ProductInterface } from '../../../product/interfaces/product.interface';
import { ProductFilterRequest, ProductFilter, ProductSpecialFilter } from '../../../product/interfaces';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-dash-sale-page',
  standalone: true,
  imports: [PaginationComponent, MatIconModule],
  templateUrl: './dash-sale-page.component.html',
})
export class DashSalePageComponent {

  private productService = inject(ProductService);
  paginationService = inject(PaginationService);
  private profileService = inject(ProfileService);

  organizerId = signal<number | null>(null);
  sales = signal<ProductInterface[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // ⚠️ Mensaje de advertencia si no ingresó filtros
  filterWarning = signal<string>('');

  // ❗ Filtros TEMPORALES (inputs)
  tempFilters = signal<ProductFilterRequest>({
    page: 1,
    pageSize: 10,
    search: undefined,
    sortBy: undefined,
    sortDesc: false,
    filter: {} as ProductFilter,
    specialFilter: {} as ProductSpecialFilter
  });

  // ❗ Filtros APLICADOS (los que sí se envían al backend)
  appliedFilters = signal<ProductFilterRequest>({
    page: 1,
    pageSize: 10,
    search: undefined,
    sortBy: undefined,
    sortDesc: false,
    filter: {} as ProductFilter,
    specialFilter: {} as ProductSpecialFilter
  });

  // Nuevo: indica que el usuario aplicó filtros de búsqueda
  appliedSearchActive = signal(false);
  // Nuevo: true si la última consulta con filtros devolvió 0 resultados
  noResults = signal(false);

  // habilita el botón Aplicar sólo si hay algún valor en los filtros temporales
  canApplyFilters = computed(() => {
    const t = this.tempFilters();
    const hasSearch = !!(t.search && String(t.search).trim().length > 0);
    const min = t.filter?.minPrice ?? 0;
    const max = t.filter?.maxPrice ?? 0;
    return hasSearch || (min > 0) || (max > 0);
  });

  constructor() {

    this.isLoading.set(true);
    this.initializeOrganizerAndProducts();

    // Efecto para que SOLO cambie al cambiar de página
    effect(() => {
      const page = this.paginationService.page();
      const org = this.organizerId();
      if (!org) return;
      this.loadProducts(page);
    });
  }

  private async initializeOrganizerAndProducts() {
    try {
      const user = await firstValueFrom(this.profileService.getProfileUser());
      if (!user || !user.organizerId) {
        this.error.set('No se encontró un organizador válido.');
        this.organizerId.set(null);
        return;
      }

      this.organizerId.set(user.organizerId);

    } catch (err) {
      console.error(err);
      this.error.set('Error al cargar el usuario.');
      this.organizerId.set(null);
    }
  }

  updateFilter(key: keyof ProductFilterRequest, value: any) {
    this.tempFilters.update(f => ({ ...f, [key]: value }));
  }

  updateNestedFilter(section: 'filter' | 'specialFilter', key: string, value: any) {
    this.tempFilters.update(f => ({
      ...f,
      [section]: {
        ...f[section],
        [key]: value
      }
    }));
  }

  applyFilters() {
    // seguridad extra: no aplicar si no hay criterios
    if (!this.canApplyFilters()) {
      this.filterWarning.set('Debes ingresar al menos un criterio para aplicar filtros.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    const f = this.tempFilters();

    // Limpia advertencia
    this.filterWarning.set('');

    // Aplica filtros reales
    this.appliedFilters.set(structuredClone(f));

    // marcar que hay filtros aplicados (búsqueda)
    this.appliedSearchActive.set(true);
    this.noResults.set(false);

    // Regresar a página 1
    this.paginationService.setPage(1);

    this.loadProducts(1);
  }

  // Limpiar filtros y volver al estado general
  clearFilters() {
    const defaultFilter: ProductFilterRequest = {
      page: 1,
      pageSize: 10,
      search: undefined,
      sortBy: undefined,
      sortDesc: false,
      filter: {} as ProductFilter,
      specialFilter: {} as ProductSpecialFilter
    };
    this.tempFilters.set(structuredClone(defaultFilter));
    this.appliedFilters.set(structuredClone(defaultFilter));
    this.appliedSearchActive.set(false);
    this.noResults.set(false);
    this.paginationService.setPage(1);
    this.loadProducts(1);
  }

  loadProducts(page: number) {
    const orgId = this.organizerId();
    if (!orgId) return;

    this.isLoading.set(true);
    this.error.set(null);

    const filtersToApply = {
      ...this.appliedFilters(),
      page,
      pageSize: this.paginationService.pageSize()
    };

    this.productService.getProductsByOrganizer(orgId, filtersToApply).subscribe({
      next: (res) => {
        const items = res.items || [];
        this.sales.set(items);

        // calcular totalPages correctamente a partir de totalItems
        const totalItems = res.totalItems ?? 0;
        const ps = this.paginationService.pageSize();
        const totalPages = Math.max(1, Math.ceil(totalItems / (ps || 1)));
        this.paginationService.setTotalPages(totalPages);

        // si estamos en modo búsqueda y no hay items -> marcar noResults
        if (this.appliedSearchActive() && items.length === 0) {
          this.noResults.set(true);
        } else {
          this.noResults.set(false);
        }

        this.isLoading.set(false);
      },
      error: () => {
        this.error.set("Error cargando productos.");
        this.sales.set([]);
        this.isLoading.set(false);
      }
    });
  }

  confirmDeleteProduct(product: ProductInterface) {
    const id = (product as any).productId ?? (product as any).id ?? null;
    if (!id) {
      console.warn('No product id found for', product);
      return;
    }
    const ok = window.confirm('¿Seguro que deseas eliminar este producto?');
    if (!ok) return;
    this.deleteProduct(id);
  }

  private deleteProduct(productId: number) { 
    this.isLoading.set(true);
    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        // recargar página actual
        this.loadProducts(this.paginationService.page());
      },
      error: (err) => {
        console.error('Error eliminando producto', err);
        this.error.set('Error eliminando producto.');
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(newPage: number) {
    this.paginationService.setPage(newPage);
  }
}
