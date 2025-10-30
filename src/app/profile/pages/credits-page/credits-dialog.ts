// src/app/dialogs/credits-dialog/credits-dialog.ts (Crea una nueva carpeta 'dialogs')

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

// Define la interfaz de los datos que recibirá el modal
export interface CreditData {
  currentBalance: number;
  currency: string;
}

@Component({
  selector: 'app-credits-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule],
  templateUrl: './credits-dialog.html',
})
export class CreditsDialog {

  // La referencia y los datos se inyectan automáticamente por MatDialog
  constructor(
    public dialogRef: MatDialogRef<CreditsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: CreditData
  ) {}

  // Cierra el modal
  onClose(): void {
    this.dialogRef.close();
  }

  // Simula la acción de recarga (aquí iría la navegación a una página de recarga)
  onRecharge(): void {
    alert('Navegando a Recargar Créditos...');
    this.dialogRef.close();
  }
}