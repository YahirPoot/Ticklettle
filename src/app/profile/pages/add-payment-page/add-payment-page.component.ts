import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HeaderBackComponent } from '../../../shared/components/header-back/header-back.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-add-payment-page',
  imports: [ReactiveFormsModule, MatIconModule, HeaderBackComponent],
  templateUrl: './add-payment-page.component.html',
})
export class AddPaymentPageComponent { 
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private notificationSvc = inject(NotificationService);

  cardForm = this.fb.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
    cardHolder: ['', [Validators.required, Validators.maxLength(50)]],
    expiryMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
    expiryYear: ['', [Validators.required, Validators.min(new Date().getFullYear() % 100), Validators.max(99)]],
    cvc: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
    isDefault: [false]
  });

  onSubmit() {
    if (this.cardForm.valid) {
      this.notificationSvc.showNotification('Tarjeta guardada exitosamente', 'success');

      this.router.navigate(['../payments'], { relativeTo: this.route.parent });
    } else {
      this.cardForm.markAllAsTouched();
      this.notificationSvc.showNotification('Por favor, revisa los datos ingresados', 'error');
    }
  }

  goBack() {
    this.router.navigate(['../payments'], { relativeTo: this.route });
  }

}
