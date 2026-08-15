import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  FormsModule,
} from '@angular/forms';

import {
  EventTypeE,
  ProcessedEventFilterDto,
} from '../../../services/dtos/process-event-filter.dto';

import {
  UserDto,
} from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-events-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './events-filters.component.html',
  styleUrl: './events-filters.component.scss',
})
export class EventsFiltersComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input({ required: true })
  filter!: ProcessedEventFilterDto;

  @Input()
  searchTerm: string = '';

  @Input()
  eventTypes: {
    key: string;
    label: string;
  }[] = [];

  @Input()
  filteredUsers: UserDto[] = [];

  @Input()
  showUserDropdown: boolean = false;

  @Input()
  showFromError: boolean = false;

  @Input()
  showToError: boolean = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  userInputChange =
    new EventEmitter<string>();

  @Output()
  userSelected =
    new EventEmitter<UserDto>();

  @Output()
  eventTypeChange =
    new EventEmitter<EventTypeE | undefined>();

  @Output()
  fromChange =
    new EventEmitter<string | undefined>();

  @Output()
  toChange =
    new EventEmitter<string | undefined>();

  @Output()
  sortChange =
    new EventEmitter<'asc' | 'desc'>();

  @Output()
  descriptionChange =
    new EventEmitter<string>();

  @Output()
  searchRequested =
    new EventEmitter<void>();

  @Output()
  clearRequested =
    new EventEmitter<void>();

  @Output()
  dropdownBlurred =
    new EventEmitter<void>();


  /* =========================
     USER
  ========================= */

  onUserInput(
    value: string,
  ): void {
    this.searchTerm = value;

    this.userInputChange.emit(
      value,
    );
  }


  onSelectUser(
    user: UserDto,
  ): void {
    this.userSelected.emit(
      user,
    );
  }


  onUserBlur(): void {
    this.dropdownBlurred.emit();
  }


  /* =========================
     EVENT TYPE
  ========================= */

  onEventTypeChange(
    value: string,
  ): void {
    this.eventTypeChange.emit(
      value
        ? value as EventTypeE
        : undefined,
    );
  }


  /* =========================
     DATE
  ========================= */

  onFromChange(
    value: string,
  ): void {
    this.fromChange.emit(
      value || undefined,
    );
  }


  onToChange(
    value: string,
  ): void {
    this.toChange.emit(
      value || undefined,
    );
  }


  /* =========================
     SORT
  ========================= */

  onSortChange(
    value: string,
  ): void {
    this.sortChange.emit(
      value === 'asc'
        ? 'asc'
        : 'desc',
    );
  }


  /* =========================
     DESCRIPTION
  ========================= */

  onDescriptionChange(
    value: string,
  ): void {
    this.descriptionChange.emit(
      value,
    );
  }


  /* =========================
     ACTIONS
  ========================= */

  onSearch(): void {
    this.searchRequested.emit();
  }


  onClear(): void {
    this.clearRequested.emit();
  }


  /* =========================
     USER HELPERS
  ========================= */

  getUserName(
    user: UserDto,
  ): string {
    const firstName =
      user.firstName || '';

    const lastName =
      user.lastName || '';

    return [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim() ||
      'Usuario';
  }


  getUserSecondaryText(
    user: UserDto,
  ): string {
    return (
      user.emailAddress ||
      user.email ||
      `ID ${user.id}`
    );
  }


  getUserInitials(
    user: UserDto,
  ): string {
    const name =
      this.getUserName(user);

    if (
      !name ||
      name === 'Usuario'
    ) {
      return 'U';
    }

    const parts =
      name
        .trim()
        .split(/\s+/);

    const first =
      parts[0]
        ?.charAt(0) ||
      '';

    const last =
      parts.length > 1
        ? parts[
            parts.length - 1
          ]?.charAt(0) || ''
        : '';

    return `${first}${last}`
      .toUpperCase();
  }


  /* =========================
     EVENT TYPE LABEL
  ========================= */

  getEventTypeLabel(
    type: string,
  ): string {
    const option =
      this.eventTypes.find(
        item =>
          item.key === type,
      );

    return (
      option?.label ||
      type
    );
  }


  /* =========================
     STATE
  ========================= */

  get hasActiveFilters(): boolean {
    return !!(
      this.searchTerm?.trim() ||
      this.filter?.processedById ||
      this.filter?.eventType ||
      this.filter?.from ||
      this.filter?.to ||
      this.filter?.search ||
      this.filter?.sort === 'asc'
    );
  }


  /* =========================
     PROTECTED
  ========================= */

  protected readonly EventTypeE =
    EventTypeE;
}