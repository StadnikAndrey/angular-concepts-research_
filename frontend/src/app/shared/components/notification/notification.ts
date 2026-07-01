import { Component, inject } from '@angular/core';

import { NotificationStore } from '../../../core/store/notification-store';

@Component({
    selector: 'app-notification',
    imports: [],
    templateUrl: './notification.html',
    styleUrl: './notification.scss',
})
export class Notification {
    notificationStore = inject(NotificationStore);
}