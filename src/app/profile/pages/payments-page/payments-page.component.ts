import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, NgClass } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderBackComponent } from '../../../shared/components/header-back/header-back.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

interface PaymentMethod {
  id: number;
  brand: 'Visa' | 'Mastercard' | 'Amex';
  last4: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    NgClass,
    HeaderBackComponent,
    ConfirmModalComponent
  ],
  templateUrl: './payments-page.component.html',
})
export class PaymentsPageComponent {

  paymentMethods: PaymentMethod[] = [
    { id: 1, brand: 'Visa', last4: '1234', isDefault: true },
    { id: 2, brand: 'Mastercard', last4: '5678', isDefault: false },
    { id: 3, brand: 'Amex', last4: '3001', isDefault: false }
  ];

  // Modal de confirmación
  showDeleteModal = false;
  methodIdToDelete: number | null = null;

  constructor(private router: Router, private route: ActivatedRoute) { }

  getCardLogoStyle(brand: string): string {
    switch (brand.toLowerCase()) {
      case 'visa': return 'bg-blue-700';
      case 'mastercard': return 'bg-red-600';
      case 'amex': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  }

  // Abrir modal
  askToDelete(id: number): void {
    this.methodIdToDelete = id;
    this.showDeleteModal = true;
  }

  // Confirmación
  confirmDelete(): void {
    this.paymentMethods = this.paymentMethods.filter(
      method => method.id !== this.methodIdToDelete
    );
    this.closeModal();
  }

  // Cancelación o cierre
  closeModal(): void {
    this.showDeleteModal = false;
    this.methodIdToDelete = null;
  }

  addNewMethod(): void {
    this.router.navigate(['../add-method'], { relativeTo: this.route });
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
