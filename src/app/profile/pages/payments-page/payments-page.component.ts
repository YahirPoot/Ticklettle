// payments-page.ts (Ajuste de la estructura de datos)

import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, NgClass } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

interface PaymentMethod {
    id: number;
    brand: 'Visa' | 'Mastercard' | 'Amex';
    last4: string;
    isDefault: boolean; // Nuevo campo para el diseño moderno
}

@Component({
    selector: 'app-payments-page',
    standalone: true,
    imports: [MatIconModule, CommonModule, NgClass],
    templateUrl: './payments-page.component.html',
})
export class PaymentsPageComponent {

    paymentMethods: PaymentMethod[] = [
        { id: 1, brand: 'Visa', last4: '1234', isDefault: true },
        { id: 2, brand: 'Mastercard', last4: '5678', isDefault: false },
        { id: 3, brand: 'Amex', last4: '3001', isDefault: false }
    ];

    constructor(private router: Router, private route: ActivatedRoute) { 
        console.log('Página de Métodos de Pago cargada.');
    }
    // Función para asignar estilos de color basados en la marca (simulando el diseño de la tarjeta)
    getCardLogoStyle(brand: string): string {
        switch (brand.toLowerCase()) {
            case 'visa':
                // Azul distintivo para Visa
                return 'bg-blue-700'; 
            case 'mastercard':
                // Degradado o color fuerte para Mastercard
                return 'bg-red-600'; 
            case 'amex':
                // Verde elegante para Amex
                return 'bg-green-600'; 
            default:
                return 'bg-gray-500';
        }
    }

    removePaymentMethod(id: number): void {
        console.log(`Eliminando método de pago con ID: ${id}`);
        this.paymentMethods = this.paymentMethods.filter(method => method.id !== id);
    }

    addNewMethod(): void {
        console.log('Navegando a formulario para agregar nueva tarjeta...');
        this.router.navigate(['../add-method'], { relativeTo: this.route });
        // Navegación o modal para formulario de tarjeta
    }
}