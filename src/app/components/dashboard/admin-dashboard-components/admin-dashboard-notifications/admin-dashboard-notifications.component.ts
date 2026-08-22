import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import {
  NotificationService,
} from '../../../../services/notification.service';

import {
  Notification,
  NotificationListResponse,
} from '../../../../services/dtos/notification.dto';


@Component({
  selector: 'app-admin-dashboard-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './admin-dashboard-notifications.component.html',
  styleUrl: './admin-dashboard-notifications.component.scss',
})
export class AdminDashboardNotificationsComponent
  implements OnInit {

  /* =========================
     STATE
  ========================= */

  notifications: Notification[] = [];

  unreadCount = 0;

  loading = false;


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private notificationService: NotificationService,
    private router:Router,
  ) {}


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.loadUnreadNotifications();
  }


  /* =========================
     LOAD UNREAD
  ========================= */

  private loadUnreadNotifications(): void {

    this.loading = true;

    this.notificationService
      .getUserNotifications({
        page: 1,
        limit: 50,
      })
      .subscribe({

        next: response => {

          const unreadNotifications =
            (
              response.notifications ||
              []
            ).filter(
              notification =>
                !notification.isRead &&
                !notification.readAt,
            );

          this.notifications =
            unreadNotifications.slice(
              0,
              5,
            );

          this.unreadCount =
            response.unreadCount ??
            unreadNotifications.length;

          this.notificationService
            .setUnreadCount(
              this.unreadCount,
            );

          this.loading = false;
        },

        error: error => {

          console.error(
            'Error al obtener notificaciones no leídas del administrador:',
            error,
          );

          this.notifications = [];
          this.unreadCount = 0;
          this.loading = false;
        },
      });
  }

 goToNotifications(): void {

  this.router
    .navigate([
      '/dashboard/notifications-inbox',
    ])
    .then(result => {

      console.log(
        'NAVEGACIÓN RESULTADO:',
        result,
      );

      console.log(
        'URL FINAL:',
        this.router.url,
      );
    });
}


  /* =========================
     DESCRIPTION
  ========================= */

  getDescription(
    notification: Notification,
  ): string {

    const message =
      notification.message;

    if (!message) {
      return 'Nueva notificación disponible.';
    }

    return (
      message.body ||
      message['description'] ||
      message['message'] ||
      'Nueva notificación disponible.'
    );
  }


  /* =========================
     TYPE
  ========================= */

  getNotificationType(
    notification: Notification,
  ):
    | 'demo'
    | 'meeting'
    | 'user'
    | 'announcement'
    | 'report' {

    const type =
      String(
        notification.notificationType ||
        notification.message?.kind ||
        '',
      ).toLowerCase();

    if (
      type.includes('demo') ||
      type.includes('lead') ||
      type.includes('courtesy')
    ) {
      return 'demo';
    }

    if (
      type.includes('meeting') ||
      type.includes('class')
    ) {
      return 'meeting';
    }

    if (
      type.includes('user') ||
      type.includes('student')
    ) {
      return 'user';
    }

    if (
      type.includes('report')
    ) {
      return 'report';
    }

    return 'announcement';
  }


  /* =========================
     DATE
  ========================= */

  getRelativeTime(
    notification: Notification,
  ): string {

    const createdAt =
      notification.createdAt;

    if (!createdAt) {
      return '';
    }

    const created =
      new Date(createdAt);

    if (
      Number.isNaN(
        created.getTime(),
      )
    ) {
      return '';
    }

    const now =
      new Date();

    const diffMs =
      now.getTime() -
      created.getTime();

    const minutes =
      Math.floor(
        diffMs / 60000,
      );

    if (minutes < 1) {
      return 'Ahora';
    }

    if (minutes < 60) {
      return `Hace ${minutes} min`;
    }

    const hours =
      Math.floor(
        minutes / 60,
      );

    if (hours < 24) {
      return (
        `Hace ${hours} ${
          hours === 1
            ? 'hora'
            : 'horas'
        }`
      );
    }

    const days =
      Math.floor(
        hours / 24,
      );

    if (days < 7) {
      return (
        `Hace ${days} ${
          days === 1
            ? 'día'
            : 'días'
        }`
      );
    }

    return created
      .toLocaleDateString(
        'es-EC',
        {
          day: '2-digit',
          month: 'short',
        },
      );
  }


  /* =========================
     TRACK
  ========================= */

  trackByNotificationId(
    index: number,
    notification: Notification,
  ): number | string {

    return (
      notification.id ??
      index
    );
  }
}