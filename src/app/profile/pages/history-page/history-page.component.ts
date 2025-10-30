// src/app/pages/history-page/history-page.ts

import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router'; // <-- IMPORTANTE para navegación

// Definición de la estructura de una transacción
interface Transaction {
    id: number;
    date: Date;
    description: string;
    amount: number;
    currency: string;
    type: 'purchase' | 'recharge' | 'refund'; // Tipo de transacción
    status: 'completed' | 'pending' | 'failed'; // Estado
}

@Component({
    selector: 'app-history-page',
    standalone: true, 
    imports: [MatIconModule, CommonModule],
    templateUrl: './history-page.component.html',
})
export class HistoryPageComponent {
    
    transactions: Transaction[] = [
        // ... (Datos simulados, igual que el ejemplo anterior)
        { 
            id: 101, 
            date: new Date('2025-10-25T10:30:00'), 
            description: 'Compra: Concierto de Rock', 
            amount: 150.00, 
            currency: 'USD', 
            type: 'purchase', 
            status: 'completed' 
        },
        { 
            id: 102, 
            date: new Date('2025-10-24T15:45:00'), 
            description: 'Recarga de saldo (Visa)', 
            amount: 50.00, 
            currency: 'USD', 
            type: 'recharge', 
            status: 'completed' 
        },
        // ... (más datos)
    ];

    // 1. Inyectar Router y ActivatedRoute
    constructor(private router: Router, private route: ActivatedRoute) {}

    // 2. Función para regresar al perfil
    goBack(): void {
        // La navegación debe llevarnos de vuelta a la ruta principal del perfil
        // Asumiendo que el componente ProfilePage está en la ruta raíz del módulo:
        this.router.navigate(['../'], { relativeTo: this.route });
    }

    // Devuelve la clase CSS para el color del monto y estado
    getAmountClass(transaction: Transaction): string {
        switch (transaction.type) {
            case 'purchase':
                return 'text-red-600'; // Gastos
            case 'refund':
                return 'text-green-600'; // Reembolsos
            case 'recharge':
                return 'text-indigo-600'; // Recargas
            default:
                return 'text-gray-900';
        }
    }

    // Devuelve el icono relevante para la transacción
    getIconName(transaction: Transaction): string {
        switch (transaction.type) {
            case 'purchase':
                return 'shopping_cart';
            case 'recharge':
                return 'account_balance_wallet';
            case 'refund':
                return 'undo';
            default:
                return 'description';
        }
    }
}