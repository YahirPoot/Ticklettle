import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, UrlTree } from '@angular/router';

@Component({
  selector: 'shared-header-back',
  imports: [MatIconModule],
  template: `
    <header class="flex items-center mb-2">
        <button (click)="onBack()" class="btn btn-ghost btn-circle text-gray-600 hover:bg-gray-100 mr-4">
            <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="text-3xl font-bold text-gray-800">{{ title() }}</h1>
    </header>
  `,
})
export class HeaderBackComponent {
  title = input<string>('');
  backUrl? = input<string | UrlTree>('');
  back = output<void>();
  
  onBack() {
    this.back.emit();
  }
}
