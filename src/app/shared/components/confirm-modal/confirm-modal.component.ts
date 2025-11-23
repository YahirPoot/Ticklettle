import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'confirm-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './confirm-modal.component.html',
})
export class ConfirmModalComponent {

  @Input() show = false;

  @Input() modalTitle = '¿Seguro que desea eliminar el evento?';
  @Input() icon = 'delete';
  @Input() iconColor = 'text-red-600';

  @Input() confirmText = 'Eliminar';
  @Input() cancelText = 'Cancelar';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
