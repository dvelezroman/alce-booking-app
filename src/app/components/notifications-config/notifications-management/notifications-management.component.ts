import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications-management',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './notifications-management.component.html',
  styleUrl: './notifications-management.component.scss',
})
export class NotificationsManagementComponent {

  @Input() isSupported = false;

  @Input()
  permission: NotificationPermission =
    'default';

  @Input() isSubscribed = false;

  @Input() isLoading = false;


  @Output()
  enableRequested =
    new EventEmitter<void>();

  @Output()
  disableRequested =
    new EventEmitter<void>();


  enable(): void {
    if (
      this.isLoading ||
      !this.isSupported
    ) {
      return;
    }

    this.enableRequested.emit();
  }


  disable(): void {
    if (
      this.isLoading ||
      !this.isSubscribed
    ) {
      return;
    }

    this.disableRequested.emit();
  }


  get canEnable(): boolean {
    return (
      this.isSupported &&
      !this.isSubscribed &&
      !this.isLoading
    );
  }


  get canDisable(): boolean {
    return (
      this.isSubscribed &&
      !this.isLoading
    );
  }


  get subscriptionLabel(): string {
    return this.isSubscribed
      ? 'Suscrito'
      : 'No suscrito';
  }


  get disabledLabel(): string {
    return this.isSubscribed
      ? 'Activo'
      : 'Deshabilitado';
  }
}