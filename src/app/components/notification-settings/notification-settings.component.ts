import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  Subscription,
} from 'rxjs';

import {
  PushNotificationService,
} from '../../services/push-notification.service';

/* =========================
   CHILD COMPONENTS
========================= */

import {
  NotificationsConfigHeaderComponent,
} from '../../components/notifications-config/notifications-config-header/notifications-config-header.component';

import {
  NotificationsStatusComponent,
} from '../../components/notifications-config/notifications-status/notifications-status.component';

import {
  NotificationsManagementComponent,
} from '../../components/notifications-config/notifications-management/notifications-management.component';

import {
  NotificationsDetailsComponent,
} from '../../components/notifications-config/notifications-details/notifications-details.component';

import {
  NotificationsHelpComponent,
} from '../../components/notifications-config/notifications-help/notifications-help.component';

import {
  NotificationsImportantInfoComponent,
} from '../../components/notifications-config/notifications-important-info/notifications-important-info.component';


@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [
    CommonModule,
    NotificationsConfigHeaderComponent,
    NotificationsStatusComponent,
    NotificationsManagementComponent,
    NotificationsDetailsComponent,
    NotificationsHelpComponent,
    NotificationsImportantInfoComponent,
  ],
  templateUrl: './notification-settings.component.html',
  styleUrl: './notification-settings.component.scss',
})
export class NotificationSettingsComponent
  implements OnInit, OnDestroy {

  /* =========================
     STATE
  ========================= */

  isSupported = false;

  permission:
    NotificationPermission =
    'default';

  isSubscribed = false;

  isLoading = false;

  errorMessage:
    string |
    null =
    null;

  private subscriptions:
    Subscription[] = [];


  constructor(
    private pushNotificationService:
      PushNotificationService,
  ) {}


  /* =========================
     INIT
  ========================= */

  ngOnInit() {
    this.isSupported =
      this.pushNotificationService
        .isSupported();

    if (this.isSupported) {

      this.subscriptions.push(
        this.pushNotificationService
          .permission$
          .subscribe(
            permission => {
              this.permission =
                permission;
            },
          ),
      );


      this.subscriptions.push(
        this.pushNotificationService
          .isSubscribed()
          .subscribe(
            isSubscribed => {
              this.isSubscribed =
                isSubscribed;
            },
          ),
      );


      this.subscriptions.push(
        this.pushNotificationService
          .lastError$
          .subscribe(
            message => {
              this.errorMessage =
                message;
            },
          ),
      );
    }
  }


  /* =========================
     DESTROY
  ========================= */

  ngOnDestroy() {
    this.subscriptions
      .forEach(
        sub =>
          sub.unsubscribe(),
      );
  }


  /* =========================
     ENABLE
  ========================= */

  async enableNotifications() {
    this.isLoading = true;

    try {

      this.pushNotificationService
        .setPreferenceEnabled(
          true,
        );

      const subscription =
        await this
          .pushNotificationService
          .subscribeToPush({
            ignorePreference:
              true,
          });


      if (subscription) {

        this.pushNotificationService
          .startPeriodicNotificationCheck(
            5,
          );
      }

    } catch (error) {

      console.error(
        'Error enabling notifications:',
        error,
      );

    } finally {

      this.isLoading = false;
    }
  }


  /* =========================
     DISABLE
  ========================= */

  async disableNotifications() {
    this.isLoading = true;

    try {

      await this
        .pushNotificationService
        .unsubscribeFromPush();

    } catch (error) {

      console.error(
        'Error disabling notifications:',
        error,
      );

    } finally {

      this.isLoading = false;
    }
  }


  /* =========================
     STATUS CLASS
  ========================= */

  getStatusClass(): string {

    switch (this.permission) {

      case 'granted':
        return 'is-success';

      case 'denied':
        return 'is-danger';

      default:
        return 'is-warning';
    }
  }


  /* =========================
     STATUS TEXT
  ========================= */

  getStatusText(): string {

    switch (this.permission) {

      case 'granted':
        return 'Permitido';

      case 'denied':
        return 'Denegado';

      default:
        return 'No configurado';
    }
  }
}