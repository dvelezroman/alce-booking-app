import {
  Component,
  Input,
} from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications-important-info',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './notifications-important-info.component.html',
  styleUrl: './notifications-important-info.component.scss',
})
export class NotificationsImportantInfoComponent {

  @Input()
  permission: NotificationPermission =
    'default';

  @Input()
  errorMessage: string | null = null;


  get isDenied(): boolean {
    return this.permission === 'denied';
  }


  get isGranted(): boolean {
    return this.permission === 'granted';
  }


  get title(): string {
    if (this.errorMessage) {
      return 'Ocurrió un problema';
    }

    if (this.isDenied) {
      return 'Notificaciones bloqueadas';
    }

    if (this.isGranted) {
      return 'Notificaciones habilitadas';
    }

    return 'Importante';
  }


  get message(): string {
    if (this.errorMessage) {
      return this.errorMessage;
    }

    if (this.isDenied) {
      return (
        'Bloqueaste las notificaciones en tu navegador. ' +
        'Para volver a recibirlas debes cambiar el permiso desde la configuración del navegador.'
      );
    }

    if (this.isGranted) {
      return (
        'El navegador ya tiene permiso para mostrar notificaciones. ' +
        'Mantén activa tu suscripción para seguir recibiéndolas.'
      );
    }

    return (
      'Si bloqueaste las notificaciones anteriormente, ' +
      'debes cambiar la configuración en tu navegador.'
    );
  }


  get stateClass(): string {
    if (this.errorMessage || this.isDenied) {
      return 'danger';
    }

    if (this.isGranted) {
      return 'success';
    }

    return 'warning';
  }
}