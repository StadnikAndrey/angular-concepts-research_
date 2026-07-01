import { Component, inject } from '@angular/core';

import { NotificationStore } from '../../core/store/notification-store';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  private notificationStore = inject(NotificationStore);

  ngOnInit() {
    this.notificationStore.addNotification('From About')
  }

}
