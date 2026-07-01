import { Injectable, computed, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
    date: string
}

@Injectable({
    providedIn: 'root'
})
export class NotificationStore {
    // 1. state
    private notifications = signal<Notification[]>([]);

    // 2. getters
    readonly notificationList = this.notifications.asReadonly();
    readonly numberNotifications = computed(() => this.notifications().length);

    // 3. actions     
    addNotification(message: string, type: NotificationType = 'info'): void {
        const id = Math.random().toString(36).substring(2);
        let date = new Date().toLocaleTimeString();
        const newNotification: Notification = { id, message, type, date };

        this.notifications.update(list => [...list, newNotification]);

        let delay = this.numberNotifications() * 6000;

        setTimeout(() => {
            this.deleteNotification(id);
        }, delay);
    }

    deleteNotification(id: string) {
        this.notifications.update(list => list.filter(n => n.id !== id));
    }

    clearAllNotifications() {
        this.notifications.set([]);
    }
}