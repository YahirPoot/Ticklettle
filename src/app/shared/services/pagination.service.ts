import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PaginationService {
  page = signal<number>(1);
  pageSize = signal<number>(2);
  totalPages = signal<number>(1);

  setPage(page: number) {
    this.page.set(page);
  }

  setPageSize(pageSize: number) {
    this.pageSize.set(pageSize);
  }

  setTotalPages(totalPages: number) {
    this.totalPages.set(totalPages);
  }

  next() {
    this.page.update(p => Math.min(p + 1, this.totalPages()));
  }

  prev() {
    this.page.update(p => Math.max(p - 1, 1));
  }

  reset() {
    this.page.set(1);
  }
}