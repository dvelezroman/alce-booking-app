import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

import {
  NotificationGroupDto,
} from '../../../services/dtos/notification.dto';

@Component({
  selector: 'app-groups-table',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './groups-table.component.html',
  styleUrl: './groups-table.component.scss',
})
export class GroupsTableComponent {
  @Input()
  groups: NotificationGroupDto[] = [];

  @Input()
  loading = false;

  @Output()
  membersRequested =
    new EventEmitter<NotificationGroupDto>();

  @Output()
  editRequested =
    new EventEmitter<NotificationGroupDto>();

  @Output()
  deleteRequested =
    new EventEmitter<NotificationGroupDto>();

  openedMenuId: number | null = null;

  toggleMenu(
    event: MouseEvent,
    groupId: number,
  ): void {
    event.stopPropagation();

    this.openedMenuId =
      this.openedMenuId === groupId
        ? null
        : groupId;
  }

  closeMenu(): void {
    this.openedMenuId = null;
  }

  onMembers(
    event: MouseEvent,
    group: NotificationGroupDto,
  ): void {
    event.stopPropagation();
    this.closeMenu();
    this.membersRequested.emit(group);
  }

  onEdit(
    event: MouseEvent,
    group: NotificationGroupDto,
  ): void {
    event.stopPropagation();
    this.closeMenu();
    this.editRequested.emit(group);
  }

  onDelete(
    event: MouseEvent,
    group: NotificationGroupDto,
  ): void {
    event.stopPropagation();
    this.closeMenu();
    this.deleteRequested.emit(group);
  }

  getUsersCount(
    group: NotificationGroupDto,
  ): number {
    return (
      group.userIds?.length ??
      group.users?.length ??
      0
    );
  }

  getGroupInitials(
    group: NotificationGroupDto,
  ): string {
    const words =
      group.name
        ?.trim()
        .split(/\s+/)
        .filter(Boolean) ??
      [];

    if (!words.length) {
      return 'G';
    }

    if (words.length === 1) {
      return words[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[1].charAt(0)
    ).toUpperCase();
  }

  formatDate(
    value?: string,
  ): string {
    if (!value) {
      return '—';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '—';
    }

    return date.toLocaleDateString(
      'es-EC',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    );
  }

  formatTime(
    value?: string,
  ): string {
    if (!value) {
      return '';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '';
    }

    return date.toLocaleTimeString(
      'es-EC',
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  }

  trackByGroupId(
    index: number,
    group: NotificationGroupDto,
  ): number {
    return group.id;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeMenu();
  }
}