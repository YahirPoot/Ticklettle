import { Component, Input, Output, EventEmitter, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'confirm-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './confirm-modal.component.html',
})
export class ConfirmModalComponent {

  show = input<boolean>(false);
  modalTitle = input<string>('¿Seguro que desea eliminar el evento?');
  icon = input<string>('delete');
  iconColor = input<string>('text-red-600');

  confirmText = input<string>('Eliminar')
  cancelText = input<string>('Cancelar')
  
  confirm = output<void>();
  cancel = output<void>();
}
