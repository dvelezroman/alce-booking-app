import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

interface InboxSummaryItem {
  label: string;
  value: number;
  type:
    | 'total'
    | 'unread'
    | 'read'
    | 'today'
    | 'week';
}

@Component({
  selector: 'app-inbox-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './inbox-summary.component.html',
  styleUrl: './inbox-summary.component.scss',
})
export class InboxSummaryComponent {
  @Input() total = 0;
  @Input() unreadCount = 0;
  @Input() readCount = 0;
  @Input() todayCount = 0;
  @Input() weekCount = 0;

  get summaryItems(): InboxSummaryItem[] {
    return [
      {
        label: 'Todas las notificaciones',
        value: this.total,
        type: 'total',
      },
      {
        label: 'No leídas',
        value: this.unreadCount,
        type: 'unread',
      },
      {
        label: 'Leídas',
        value: this.readCount,
        type: 'read',
      },
      {
        label: 'Hoy',
        value: this.todayCount,
        type: 'today',
      },
      {
        label: 'Esta semana',
        value: this.weekCount,
        type: 'week',
      },
    ];
  }

  trackByType(
    _index: number,
    item: InboxSummaryItem
  ): InboxSummaryItem['type'] {
    return item.type;
  }
}