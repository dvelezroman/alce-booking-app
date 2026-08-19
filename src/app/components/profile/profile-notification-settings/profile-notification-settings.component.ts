import {
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector:
    'app-profile-notification-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl:
    './profile-notification-settings.component.html',
  styleUrl:
    './profile-notification-settings.component.scss',
})
export class ProfileNotificationSettingsComponent {
  @Input() meetingsAlert = false;

  constructor(
    private readonly router: Router
  ) {}

  get title(): string {
    return this.meetingsAlert
      ? '¡Alertas de clases activadas!'
      : '¡Activa las alertas de clases!';
  }

  get description(): string {
    return this.meetingsAlert
      ? 'Tienes las alertas de reuniones activadas.'
      : 'Activa las alertas para recibir recordatorios de tus próximas clases.';
  }

  get buttonLabel(): string {
    return 'Gestionar notificaciones';
  }

  manageNotifications(): void {
    this.router.navigate([
      '/dashboard/notification-settings',
    ]);
  }
}