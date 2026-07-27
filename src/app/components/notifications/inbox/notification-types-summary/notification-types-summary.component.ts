import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  Notification,
  NotificationTypeEnum,
} from '../../../../services/dtos/notification.dto';

export interface NotificationTypeSummaryItem {
  type: Notification['notificationType'];
  label?: string;
  count: number;
}

interface NotificationTypeViewItem {
  type: Notification['notificationType'];
  label: string;
  count: number;
}

@Component({
  selector: 'app-notification-types-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl:
    './notification-types-summary.component.html',
  styleUrl:
    './notification-types-summary.component.scss',
})
export class NotificationTypesSummaryComponent {
  @Input() items: NotificationTypeSummaryItem[] = [];

  @Output() viewAll =
    new EventEmitter<void>();

  private readonly notificationTypes:
    NotificationTypeViewItem[] = [
      {
        type: NotificationTypeEnum.Meeting,
        label: 'Meeting',
        count: 0,
      },
      {
        type: NotificationTypeEnum.Assessment,
        label: 'Assessment',
        count: 0,
      },
      {
        type: NotificationTypeEnum.Announce,
        label: 'Announce',
        count: 0,
      },
      {
        type: NotificationTypeEnum.System,
        label: 'System',
        count: 0,
      },
      {
        type: NotificationTypeEnum.Advice,
        label: 'Advice',
        count: 0,
      },
      {
        type: NotificationTypeEnum.Commentary,
        label: 'Commentary',
        count: 0,
      },
      {
        type: NotificationTypeEnum.Mandatory,
        label: 'Mandatory',
        count: 0,
      },
    ];

  get visibleItems(): NotificationTypeViewItem[] {
    return this.notificationTypes.map((typeItem) => {
      const receivedItem = this.items.find(
        (item) => item.type === typeItem.type
      );

      return {
        type: typeItem.type,
        label:
          receivedItem?.label?.trim() ||
          typeItem.label,
        count: receivedItem?.count ?? 0,
      };
    });
  }

  get total(): number {
    return this.visibleItems.reduce(
      (accumulator, item) =>
        accumulator + item.count,
      0
    );
  }

  get hasItems(): boolean {
    return this.visibleItems.length > 0;
  }

  onViewAll(): void {
    this.viewAll.emit();
  }

  trackByType(
    _index: number,
    item: NotificationTypeViewItem
  ): Notification['notificationType'] {
    return item.type;
  }
}