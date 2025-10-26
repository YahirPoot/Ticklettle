export interface NotificationData {
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    duration?: number; // in milliseconds
}