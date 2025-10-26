import { Injectable, signal } from '@angular/core';
import { NotificationData } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class Notification {
  
  notification = signal<NotificationData | null>(null);

  showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) {
    this.notification.set({ message, type, duration });
  }

  clearNotification() {
    this.notification.set(null);  
  }
}
