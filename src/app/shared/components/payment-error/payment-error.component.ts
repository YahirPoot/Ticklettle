import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-error',
  imports: [],
  templateUrl: './payment-error.component.html',
})
export class PaymentErrorComponent { 
  private router = inject(Router);

  errorMessage = input<string | null>(null);
  supportEmail = input<string>('soporte@tuapp.com');
  retry = output<void>();
  changeMethod = output<void>();

  loading = signal(false);
  showDetails = signal<boolean>(false);

  // muestra una versión corta del error (si es muy largo)
  get shortError(): string {
    const v = this.errorMessage();
    if (!v) return '';
    return v.length > 60 ? v.slice(0, 60) + '…' : v;
  }

  async onRetry() {
    this.router.navigateByUrl('/tickets/checkout', { replaceUrl: true });
    // this.loading.set(true);
    // try {
    //   // Emitir para que el componente padre reintente el pago
    //   this.retry.emit();
    // } finally {
    //   // El padre puede controlar el loading real; aquí solo un fallback visual
    //   setTimeout(() => this.loading.set(false), 600);
    // }
  }

  onChangeMethod() {
    this.changeMethod.emit();
  }
  
  copyError() {
    const v = this.errorMessage();
    if (!v) return;
    navigator.clipboard?.writeText(v).catch(() => {
      alert('No se pudo copiar el código de error. Selecciona y copia manualmente.');
    });
  }

  contactSupport() {
    const v = this.errorMessage();
    const subject = encodeURIComponent('Error en pago - Ayuda');
    const body = encodeURIComponent(`Tuve un error al pagar. Detalles:\n\n${v ?? 'Sin detalles.'}\n\nURL: ${location.href}`);
    window.location.href = `mailto:${this.supportEmail()}?subject=${subject}&body=${body}`;
  }
}
