import { Component, effect, inject } from '@angular/core';
import { LoadingModalService } from '../../services/loading-modal.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'shared-loading',
  imports: [NgClass],
  template: `
    @if (loadingService.state().isVisible) {
      <div class="modal modal-open">
        <div class="fixed inset-0 bg-black/65 backdrop-blur-sm"></div>

        <div class="modal-box max-w-xs border-0 shadow-lg">
          <div class="flex items-center justify-center gap-3 py-4">
            <span [class]="'loading loading-spinner loading-xl'" [ngClass]="alertType"></span>
            <span class="text-sm font-medium text-neutral-content">
              {{ loadingService.state().message }}
            </span>
          </div>
        </div>
      </div>
}

  `,
})
export class LoadingComponent { 
  loadingService = inject(LoadingModalService);

  type: 'create' | 'update' | 'delete' = 'create';

  constructor() {
    effect(() => {
      const modalState = this.loadingService.state();
      if (modalState) {
        this.type = modalState.type ?? 'create';
      }
    })
  }

  get alertType() {
    const types = {
      create: 'text-success',
      update: 'text-info',
      delete: 'text-error',
    }
    return types[this.type!] || 'text-success';
  }
}
