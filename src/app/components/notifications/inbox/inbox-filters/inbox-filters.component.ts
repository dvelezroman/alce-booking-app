import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  InboxFilters,
  NotificationTypeEnum,
} from '../../../../services/dtos/notification.dto';

interface FilterOption<T = string | number> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-inbox-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './inbox-filters.component.html',
  styleUrl: './inbox-filters.component.scss',
})
export class InboxFiltersComponent implements OnChanges {
  @Input() filters!: InboxFilters;
  @Input() readDays = 30;
  @Input() disabled = false;

  @Output() filtersChange =
    new EventEmitter<InboxFilters>();

  @Output() readDaysChange =
    new EventEmitter<number>();

  @Output() clearFilters =
    new EventEmitter<void>();

  localFilters: InboxFilters =
    this.createEmptyFilters();

  readonly readStateOptions:
    FilterOption<string>[] = [
      {
        label: 'Todas',
        value: 'all',
      },
      {
        label: 'No leídas',
        value: 'unread',
      },
      {
        label: 'Leídas',
        value: 'read',
      },
    ];

  readonly notificationTypeOptions:
    FilterOption<string>[] = [
      {
        label: 'Todos los tipos',
        value: '',
      },
      {
        label: 'Clases',
        value:
          NotificationTypeEnum.Meeting,
      },
      {
        label: 'Evaluaciones',
        value:
          NotificationTypeEnum.Assessment,
      },
      {
        label: 'Anuncios',
        value:
          NotificationTypeEnum.Announce,
      },
      {
        label: 'Avisos',
        value:
          NotificationTypeEnum.Advice,
      },
      {
        label: 'Comentarios',
        value:
          NotificationTypeEnum.Commentary,
      },
      {
        label: 'Importantes',
        value:
          NotificationTypeEnum.Mandatory,
      },
      {
        label: 'Sistema',
        value:
          NotificationTypeEnum.System,
      },
    ];

  readonly readDaysOptions:
    FilterOption<number>[] = [
      {
        label: 'Últimos 7 días',
        value: 7,
      },
      {
        label: 'Últimos 15 días',
        value: 15,
      },
      {
        label: 'Últimos 30 días',
        value: 30,
      },
      {
        label: 'Últimos 60 días',
        value: 60,
      },
      {
        label: 'Últimos 90 días',
        value: 90,
      },
    ];

  ngOnChanges(
    changes: SimpleChanges
  ): void {
    if (
      changes['filters'] &&
      this.filters
    ) {
      this.localFilters = {
        ...this.createEmptyFilters(),
        ...this.filters,
      };
    }
  }

  onSearchChange(
    value: string
  ): void {
    this.localFilters = {
      ...this.localFilters,
      search: value,
    };

    this.emitFilters();
  }

  onReadStateChange(
    value: InboxFilters['readState']
  ): void {
    this.localFilters = {
      ...this.localFilters,
      readState: value,
    };

    this.emitFilters();
  }

  onTypeChange(
    value: InboxFilters['type']
  ): void {
    this.localFilters = {
      ...this.localFilters,
      type: value,
    };

    this.emitFilters();
  }

  onFromDateChange(
    value: string
  ): void {
    this.localFilters = {
      ...this.localFilters,
      fromDate: value,
    };

    this.validateDateRange();

    this.emitFilters();
  }

  onToDateChange(
    value: string
  ): void {
    this.localFilters = {
      ...this.localFilters,
      toDate: value,
    };

    this.validateDateRange();

    this.emitFilters();
  }

  onReadDaysChange(
    value: number | string
  ): void {
    const parsedValue =
      Number(value);

    if (
      Number.isNaN(parsedValue) ||
      parsedValue <= 0 ||
      parsedValue === this.readDays
    ) {
      return;
    }

    this.readDaysChange.emit(
      parsedValue
    );
  }

  onClearFilters(): void {
    if (this.disabled) {
      return;
    }

    this.localFilters =
      this.createEmptyFilters();

    this.clearFilters.emit();
  }

  get hasActiveFilters(): boolean {
    const search =
      this.localFilters.search
        ?.trim() || '';

    return Boolean(
      search ||
      this.localFilters.type ||
      this.localFilters.status ||
      this.localFilters.scope ||
      this.localFilters.priority ||
      this.localFilters.fromDate ||
      this.localFilters.toDate ||
      (
        this.localFilters.readState &&
        this.localFilters.readState !==
          'all'
      )
    );
  }

  get hasInvalidDateRange(): boolean {
    if (
      !this.localFilters.fromDate ||
      !this.localFilters.toDate
    ) {
      return false;
    }

    const fromDate =
      new Date(
        `${this.localFilters.fromDate}T00:00:00`
      );

    const toDate =
      new Date(
        `${this.localFilters.toDate}T23:59:59`
      );

    return fromDate > toDate;
  }

  get todayDate(): string {
    const today = new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        today.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private emitFilters(): void {
    if (
      this.disabled ||
      this.hasInvalidDateRange
    ) {
      return;
    }

    this.filtersChange.emit({
      ...this.localFilters,
      search:
        this.localFilters.search
          ?.trimStart() || '',
    });
  }

  private validateDateRange(): void {
    if (
      !this.localFilters.fromDate ||
      !this.localFilters.toDate
    ) {
      return;
    }

    const fromDate =
      new Date(
        `${this.localFilters.fromDate}T00:00:00`
      );

    const toDate =
      new Date(
        `${this.localFilters.toDate}T23:59:59`
      );

    if (fromDate <= toDate) {
      return;
    }

    this.localFilters = {
      ...this.localFilters,
      toDate: '',
    };
  }

  private createEmptyFilters():
    InboxFilters {
    return {
      search: '',
      status: '',
      type: '',
      scope: '',
      fromDate: '',
      toDate: '',
      priority: '',
      readState: 'all',
    };
  }
}