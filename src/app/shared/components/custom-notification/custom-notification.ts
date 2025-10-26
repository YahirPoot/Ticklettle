import { Component, effect, inject, OnDestroy, signal } from '@angular/core';
import { Notification } from '../../services/notification';
import { NgClass } from '@angular/common';


@Component({
  selector: 'shared-custom-notification',
  imports: [NgClass],
  templateUrl: './custom-notification.html',
})
export class CustomNotification implements OnDestroy {
  notificationService = inject(Notification);

  show: boolean = false;
  type: 'success' | 'error' | 'info' | 'warning' = 'info';
  message: string = '';
  duration: number = 4000;
  customIcon?: string;
  private timeoutId?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      const notification = this.notificationService.notification();
      if (notification) {
        this.type = notification.type || 'info';
        this.message = notification.message;
        this.duration = notification.duration || 4000;
        this.show = true;
        this.startAutoClose();
      } else {
        this.show = false;
        this.clearAutoClose();
      }
    })
  }

  private startAutoClose() {
    if (this.duration > 0) {
      this.timeoutId = setTimeout(() => this.close(), this.duration);
    }
  }

  private clearAutoClose() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
  
  close() {
    this.notificationService.clearNotification();
  }

  ngOnDestroy(): void {
    this.clearAutoClose();
  }

  get alertType() {
    const types = {
      success: 'alert-success',
      error: 'alert-error',
      info: 'alert-info',
      warning: 'alert-warning'
    }
    return types[this.type] || 'alert-success';
  }

  get alertClass() {
    return `alert ${this.alertType}`;
  }

  get defaultIcon() {
    const icons = {
      success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z'
    };
    return icons[this.type];
  }
}
