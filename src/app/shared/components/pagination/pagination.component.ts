import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'shared-pagination',
  imports: [],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent { 
  page = input<number>(1);
  totalPages = input<number>(1);

  pageChange = output<number>();

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages()!) {
      this.pageChange.emit(p);
    }
  }
}