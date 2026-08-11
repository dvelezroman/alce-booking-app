import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { Notification } from '../../../../../../src/app/services/dtos/notification.dto';

type NotificationPriority =
  | 'high'
  | 'medium'
  | 'low'
  | 'default';

@Component({
  selector: 'app-notification-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-card.component.html',
  styleUrls: ['./notification-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationCardComponent {
  @Input({ required: true })
  notification!: Notification;

  get notificationType(): string {
    return this.normalizeValue(
      this.notification?.notificationType
    );
  }

  get notificationTypeLabel(): string {
    const labels: Record<string, string> = {
      meeting: 'Meeting',
      assessment: 'Assessment',
      announce: 'Announce',
      system: 'System',
      advice: 'Advice',
      commentary: 'Commentary',
      mandatory: 'Mandatory',
    };

    return (
      labels[this.notificationType] ??
      this.formatLabel(this.notificationType)
    );
  }

  get priority(): NotificationPriority {
    const value = this.normalizeValue(
      this.readProperty(
        'priority',
        'notificationPriority'
      )
    );

    if (
      value === 'high' ||
      value === 'alta'
    ) {
      return 'high';
    }

    if (
      value === 'medium' ||
      value === 'media'
    ) {
      return 'medium';
    }

    if (
      value === 'low' ||
      value === 'baja'
    ) {
      return 'low';
    }

    return 'default';
  }

  get priorityLabel(): string {
    const labels: Record<
      NotificationPriority,
      string
    > = {
      high: 'Prioridad Alta',
      medium: 'Prioridad Media',
      low: 'Prioridad Baja',
      default: 'Prioridad Normal',
    };

    return labels[this.priority];
  }

  get title(): string {
    return this.readTextProperty(
      'title',
      'subject',
      'name'
    ) || 'Nueva notificación';
  }

  get description(): string {
    return this.readTextProperty(
      'message',
      'body',
      'description',
      'content'
    );
  }

  get senderName(): string {
    return this.readTextProperty(
      'senderName',
      'sender',
      'createdByName',
      'authorName'
    ) || 'Sistema';
  }

  get createdAt(): Date | null {
    const rawDate = this.readProperty(
      'createdAt',
      'creationDate',
      'sentAt',
      'date'
    );

    if (!rawDate) {
      return null;
    }

    const date = new Date(
      rawDate as string | number | Date
    );

    return Number.isNaN(date.getTime())
      ? null
      : date;
  }

  get isRead(): boolean {
    const readValue = this.readProperty(
      'isRead',
      'read'
    );

    if (typeof readValue === 'boolean') {
      return readValue;
    }

    return Boolean(
      this.readProperty(
        'readAt',
        'seenAt'
      )
    );
  }

  get isUnread(): boolean {
    return !this.isRead;
  }

  get cardAriaLabel(): string {
    const state = this.isUnread
      ? 'No leída'
      : 'Leída';

    return `${this.title}. ${state}. ${this.notificationTypeLabel}`;
  }

  private readTextProperty(
    ...propertyNames: string[]
  ): string {
    const value = this.readProperty(
      ...propertyNames
    );

    return typeof value === 'string'
      ? value.trim()
      : '';
  }

  private readProperty(
    ...propertyNames: string[]
  ): unknown {
    const notificationRecord =
      this.notification as unknown as
        Record<string, unknown>;

    for (const propertyName of propertyNames) {
      const value =
        notificationRecord[propertyName];

      if (
        value !== undefined &&
        value !== null
      ) {
        return value;
      }
    }

    return null;
  }

  private normalizeValue(
    value: unknown
  ): string {
    if (
      value === undefined ||
      value === null
    ) {
      return 'default';
    }

    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '');
  }

  private formatLabel(
    value: string
  ): string {
    if (
      !value ||
      value === 'default'
    ) {
      return 'Notificación';
    }

    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
  }
}