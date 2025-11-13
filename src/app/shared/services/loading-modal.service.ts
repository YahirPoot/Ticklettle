import { Injectable, signal } from '@angular/core';
import { LoadingModalConfig } from '../interfaces';


@Injectable({
  providedIn: 'root'
})
export class LoadingModalService {
  private modalState = signal<LoadingModalConfig>({
    message: '',
    type: 'create',
    isVisible: false
  })

  readonly state = this.modalState.asReadonly();

  private startTime: number = 0;
  showModal(type: 'create' | 'update' | 'delete', customMessage?: string) {
    this.startTime = Date.now();
    const message = {
      create: customMessage || 'Creando...',
      update: customMessage || 'Actualizando...',
      delete: customMessage || 'Eliminando...'
    };
    this.modalState.set({
      message: message[type],
      type,
      isVisible: true
    });
  }

  hideModal(minDisplayTime: number = 1000) {
    const elapsed = Date.now() - this.startTime;
    const remainingTime = Math.max(0, 3000 - elapsed);
    setTimeout(() => {
      this.modalState.update(state => ({...state, isVisible: false }));
    }, remainingTime);
  }

  hideModalImmediately() {
    this.modalState.update(state => ({...state, isVisible: false }));
  }
}
