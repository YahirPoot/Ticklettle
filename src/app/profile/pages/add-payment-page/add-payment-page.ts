// src/app/pages/add-payment-page/add-payment-page.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-add-payment-page',
    // Asegúrate de importar los módulos necesarios para standalone components
    standalone: true, 
    imports: [MatIconModule, CommonModule, ReactiveFormsModule],
    templateUrl: './add-payment-page.html',
})
export class AddPaymentPage implements OnInit {
    
    // 1. Define el grupo de formulario
    cardForm: FormGroup;

    // 2. Inyecta FormBuilder (para crear el formulario) y Router (para navegar)
    constructor(
        private fb: FormBuilder, 
        private router: Router, 
        private route: ActivatedRoute // Se usa para la navegación relativa
    ) {
        // Inicializa el formulario con validadores básicos
        this.cardForm = this.fb.group({
            cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
            cardHolder: ['', [Validators.required, Validators.maxLength(50)]],
            expiryMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
            expiryYear: ['', [Validators.required, Validators.min(new Date().getFullYear() % 100), Validators.max(99)]],
            cvc: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
            isDefault: [false]
        });
    }

    ngOnInit(): void {}

    // 3. Lógica para guardar la tarjeta
    saveCard(): void {
        if (this.cardForm.valid) {
            console.log('Tarjeta válida. Guardando datos:', this.cardForm.value);
            // TODO: Aquí llamarías a tu servicio de API para guardar la tarjeta.
            
            // Navegación de regreso a la lista de pagos
            this.router.navigate(['../payments'], { relativeTo: this.route.parent });
        } else {
            // Marca todos los campos como tocados para mostrar errores
            this.cardForm.markAllAsTouched();
            console.error('El formulario es inválido. Por favor, revisa los datos.');
        }
    }

    // 4. Lógica de botón de regreso
    goBack(): void {
        this.router.navigate(['../payments'], { relativeTo: this.route });
    }
}