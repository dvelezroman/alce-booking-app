import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs';

import {
  CreateNotificationGroupDto,
  NotificationGroupDto,
} from '../../../services/dtos/notification.dto';

import {
  UserDto,
} from '../../../services/dtos/user.dto';

import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './group-form.component.html',
  styleUrl: './group-form.component.scss',
})
export class GroupFormComponent
  implements OnChanges, OnInit, OnDestroy {

  @Input() groupToEdit?: NotificationGroupDto;
  @Input() existingUserIds: number[] = [];

  @Output()
  formSubmit =
    new EventEmitter<{
      payload: CreateNotificationGroupDto;
      id?: number;
    }>();

  @Output()
  cancel =
    new EventEmitter<void>();

  name = '';
  description = '';

  searchTerm = '';
  filteredUsers: UserDto[] = [];
  selectedUsers: UserDto[] = [];

  showDropdown = false;
  loadingUsers = false;

  private searchSubject =
    new Subject<string>();

  constructor(
    private usersService: UsersService,
  ) {}

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
      )
      .subscribe((query) => {
        this.searchUsers(query);
      });
  }

  ngOnChanges(
    changes: SimpleChanges,
  ): void {
    if (changes['groupToEdit']) {
      this.initializeForm();
    }
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  private initializeForm(): void {
    if (this.groupToEdit) {
      this.name =
        this.groupToEdit.name ?? '';

      this.description =
        this.groupToEdit.description ?? '';

      this.selectedUsers = [
        ...(this.groupToEdit.users ?? []),
      ];

      return;
    }

    this.resetForm();
  }

  /* =========================
     SEARCH
  ========================= */

  onSearchChange(
    term: string,
  ): void {
    this.searchTerm = term;

    const query =
      term
        .trim()
        .toLowerCase();

    if (query.length < 2) {
      this.filteredUsers = [];
      this.showDropdown = false;
      this.loadingUsers = false;
      return;
    }

    this.loadingUsers = true;
    this.showDropdown = true;

    this.searchSubject.next(query);
  }

  private searchUsers(
    query: string,
  ): void {
    this.usersService
      .searchUsers(
        0,
        20,
        undefined,
        query,
        query,
        undefined,
        undefined,
      )
      .subscribe({
        next: (result) => {
          const unavailableIds = new Set([
            ...this.existingUserIds,
            ...this.selectedUsers.map(
              user => user.id,
            ),
          ]);

          this.filteredUsers =
            (result.users ?? []).filter(
              user =>
                !unavailableIds.has(
                  user.id,
                ),
            );

          this.showDropdown = true;
          this.loadingUsers = false;
        },

        error: () => {
          this.filteredUsers = [];
          this.showDropdown = false;
          this.loadingUsers = false;
        },
      });
  }

  /* =========================
     USERS
  ========================= */

  addUser(
    user: UserDto,
  ): void {
    const exists =
      this.selectedUsers.some(
        item =>
          item.id === user.id,
      );

    if (exists) {
      return;
    }

    this.selectedUsers = [
      ...this.selectedUsers,
      user,
    ];

    this.filteredUsers =
      this.filteredUsers.filter(
        item =>
          item.id !== user.id,
      );

    this.searchTerm = '';
    this.showDropdown = false;
  }

  removeUser(
    userId: number,
  ): void {
    this.selectedUsers =
      this.selectedUsers.filter(
        user =>
          user.id !== userId,
      );
  }

  hideDropdown(): void {
    setTimeout(() => {
      this.showDropdown = false;
    }, 150);
  }

  /* =========================
     SUBMIT
  ========================= */

  get canSubmit(): boolean {
    return (
      this.name.trim().length > 0 &&
      this.description.trim().length > 0
    );
  }

  onSubmit(): void {
    if (!this.canSubmit) {
      return;
    }

    const payload:
      CreateNotificationGroupDto = {
      name: this.name.trim(),
      description:
        this.description.trim(),
      userIds:
        this.selectedUsers.map(
          user => user.id,
        ),
    };

    this.formSubmit.emit({
      payload,
      ...(this.groupToEdit?.id && {
        id: this.groupToEdit.id,
      }),
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  /* =========================
     HELPERS
  ========================= */

  getUserName(
    user: UserDto,
  ): string {
    return (
      `${user.firstName ?? ''} ${user.lastName ?? ''}`
        .trim() ||
      'Usuario'
    );
  }

  getUserInitials(
    user: UserDto,
  ): string {
    return (
      (
        user.firstName?.charAt(0) ??
        ''
      ) +
      (
        user.lastName?.charAt(0) ??
        ''
      )
    )
      .toUpperCase() ||
      'U';
  }

  trackByUserId(
    index: number,
    user: UserDto,
  ): number {
    return user.id;
  }

  private resetForm(): void {
    this.name = '';
    this.description = '';
    this.searchTerm = '';
    this.filteredUsers = [];
    this.selectedUsers = [];
    this.showDropdown = false;
    this.loadingUsers = false;
  }
}