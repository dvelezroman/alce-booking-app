import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
} from 'rxjs';

import {
  UserDto,
  UserRole,
} from '../../../../services/dtos/user.dto';

import {
  Stage,
} from '../../../../services/dtos/student.dto';

import {
  NotificationGroupDto,
} from '../../../../services/dtos/notification.dto';

import {
  UsersService,
} from '../../../../services/users.service';


type SendOption =
  | 'user'
  | 'stage'
  | 'group'
  | 'role'
  | 'segment';

type RecipientRole =
  | 'student'
  | 'instructor'
  | 'admin';

type RecipientSegment =
  | 'kids'
  | 'teens'
  | 'adults';

type RecipientCity =
  | 'Cuenca'
  | 'Portoviejo';


@Component({
  selector: 'app-broadcast-recipient-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './broadcast-recipient-selector.component.html',
  styleUrl: './broadcast-recipient-selector.component.scss',
})
export class BroadcastRecipientSelectorComponent implements OnChanges, OnDestroy {

  protected readonly UserRole = UserRole;


  /* =========================
     INPUTS
  ========================= */

  @Input() userRole: UserRole | null = null;
  @Input() selectedAction: SendOption | '' = '';
  @Input() selectedUsers: UserDto[] = [];
  @Input() selectedStage: Stage | null = null;
  @Input() selectedRole: RecipientRole | null = null;
  @Input() stages: Stage[] = [];
  @Input() groups: NotificationGroupDto[] = [];
  @Input() loadingGroups = false;
  @Input() reset = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() sendOptionSelected =
    new EventEmitter<SendOption>();

  @Output() usersSelected =
    new EventEmitter<UserDto[]>();

  @Output() stageSelected =
    new EventEmitter<Stage | null>();

  @Output() stageUsersSelected =
    new EventEmitter<UserDto[]>();

  @Output() groupSelected =
    new EventEmitter<NotificationGroupDto | null>();

  @Output() roleSelected =
    new EventEmitter<RecipientRole | null>();

  @Output() roleUsersSelected =
    new EventEmitter<UserDto[]>();

  @Output() segmentSelected =
    new EventEmitter<RecipientSegment | null>();

  @Output() citySelected =
    new EventEmitter<RecipientCity | null>();


  /* =========================
     USER SEARCH
  ========================= */

  searchTerm = '';
  filteredUsers: UserDto[] = [];
  showUserDropdown = false;
  isSearchingUsers = false;

  private searchInput$ =
    new Subject<string>();

  private destroy$ =
    new Subject<void>();


  /* =========================
     STAGE
  ========================= */

  showStageDropdown = false;
  stageSearchTerm = '';


  /* =========================
     GROUP
  ========================= */

  showGroupDropdown = false;
  selectedGroup: NotificationGroupDto | null = null;
  groupSearchTerm = '';


  /* =========================
     ROLE
  ========================= */

  selectedRoleValue:
    RecipientRole | null = null;


  /* =========================
     SEGMENT
  ========================= */

  selectedSegment:
    RecipientSegment | null = null;


  /* =========================
     CITY
  ========================= */

  selectedCity:
    RecipientCity | null = null;

  showCityDropdown = false;

  readonly cityOptions:
    RecipientCity[] = [
      'Cuenca',
      'Portoviejo',
    ];


  constructor(
    private usersService: UsersService,
  ) {
    this.searchInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe((term: string) => {
        this.filterUsers(term);
      });
  }


  /* =========================
     CHANGES
  ========================= */

  ngOnChanges(
    changes: SimpleChanges,
  ): void {
    if (changes['selectedRole']) {
      this.selectedRoleValue =
        this.selectedRole;
    }

    if (
      changes['reset'] &&
      this.reset
    ) {
      this.resetSelector();
    }
  }


  /* =========================
     PERMISSIONS
  ========================= */

  get isInstructor(): boolean {
    return (
      String(this.userRole)
        .toUpperCase() ===
      'INSTRUCTOR'
    );
  }


  get isAdmin(): boolean {
    return (
      String(this.userRole)
        .toUpperCase() ===
      'ADMIN'
    );
  }


  get availableOptions(): SendOption[] {
    if (this.isInstructor) {
      return [
        'user',
      ];
    }

    if (this.isAdmin) {
      return [
        'user',
        'stage',
        'group',
        'role',
        'segment',
      ];
    }

    return [];
  }


  canUseOption(
    option: SendOption,
  ): boolean {
    return this.availableOptions.includes(
      option,
    );
  }


  /* =========================
     SEND OPTION
  ========================= */

  selectSendOption(
    option: SendOption,
  ): void {
    if (
      !this.canUseOption(option)
    ) {
      return;
    }

    if (
      this.selectedAction === option
    ) {
      return;
    }

    this.closeDropdowns();

    this.sendOptionSelected.emit(
      option,
    );
  }


  isOptionSelected(
    option: SendOption,
  ): boolean {
    return (
      this.selectedAction === option
    );
  }


  /* =========================
     OPTION LABELS
  ========================= */

  getOptionTitle(
    option: SendOption,
  ): string {
    switch (option) {
      case 'user':
        return 'Usuario';

      case 'stage':
        return 'Stage';

      case 'group':
        return 'Grupo';

      case 'role':
        return 'Rol';

      case 'segment':
        return 'Segmento';

      default:
        return '';
    }
  }


  getOptionDescription(
    option: SendOption,
  ): string {
    switch (option) {
      case 'user':
        return 'Enviar a uno o varios usuarios';

      case 'stage':
        return 'Enviar a estudiantes de un stage';

      case 'group':
        return 'Enviar a un grupo de usuarios';

      case 'role':
        return 'Enviar por rol de usuario';

      case 'segment':
        return 'Enviar por clasificación y ciudad';

      default:
        return '';
    }
  }


  /* =========================
     USER
  ========================= */

  onSearchChange(
    term: string,
  ): void {
    this.searchTerm = term;

    this.searchInput$.next(
      term,
    );
  }


  filterUsers(
    term: string,
  ): void {
    const normalizedTerm =
      term?.trim() ?? '';

    if (
      normalizedTerm.length < 2
    ) {
      this.filteredUsers = [];
      this.showUserDropdown = false;
      this.isSearchingUsers = false;

      return;
    }

    this.isSearchingUsers = true;

    this.usersService
      .searchUsers(
        undefined,
        undefined,
        undefined,
        normalizedTerm,
        normalizedTerm,
        undefined,
      )
      .subscribe({
        next: (result) => {
          this.filteredUsers =
            result.users ?? [];

          this.showUserDropdown =
            true;

          this.isSearchingUsers =
            false;
        },

        error: () => {
          this.filteredUsers = [];

          this.showUserDropdown =
            true;

          this.isSearchingUsers =
            false;
        },
      });
  }


  selectUser(
    user: UserDto,
  ): void {
    const exists =
      this.selectedUsers.some(
        selected =>
          selected.id === user.id,
      );

    if (!exists) {
      this.selectedUsers = [
        ...this.selectedUsers,
        user,
      ];
    }

    this.usersSelected.emit(
      this.selectedUsers,
    );

    this.showUserDropdown = true;
  }


  onUserMouseDown(
    event: MouseEvent,
  ): void {
    event.preventDefault();
  }


  onUserOptionClick(
    user: UserDto,
    event: MouseEvent,
  ): void {
    event.preventDefault();
    event.stopPropagation();

    if (
      this.isUserSelected(user)
    ) {
      this.removeSelectedUser(
        user.id,
      );

      this.showUserDropdown =
        true;

      return;
    }

    this.selectUser(
      user,
    );

    this.showUserDropdown =
      true;
  }


  removeSelectedUser(
    userId: number,
  ): void {
    this.selectedUsers =
      this.selectedUsers.filter(
        user =>
          user.id !== userId,
      );

    this.usersSelected.emit(
      this.selectedUsers,
    );

    this.showUserDropdown =
      true;
  }


  clearSelectedUsers(): void {
    this.selectedUsers = [];

    this.usersSelected.emit(
      [],
    );
  }


  isUserSelected(
    user: UserDto,
  ): boolean {
    return this.selectedUsers.some(
      selected =>
        selected.id === user.id,
    );
  }


  showUsers(): void {
    if (
      this.searchTerm
        .trim()
        .length >= 2
    ) {
      this.showUserDropdown =
        true;
    }
  }


  hideUsers(): void {
    setTimeout(() => {
      this.showUserDropdown =
        false;
    }, 180);
  }


  /* =========================
     SELECTED USERS
  ========================= */

  get selectedUsersCount(): number {
    return this.selectedUsers.length;
  }


  get hasSelectedUsers(): boolean {
    return (
      this.selectedUsers.length > 0
    );
  }


  /* =========================
     STAGE
  ========================= */

  toggleStageDropdown(): void {
    if (
      this.selectedAction !== 'stage'
    ) {
      return;
    }

    this.showStageDropdown =
      !this.showStageDropdown;

    this.showUserDropdown =
      false;

    this.showGroupDropdown =
      false;

    this.showCityDropdown =
      false;
  }


  selectStage(
    stage: Stage,
  ): void {
    this.stageSelected.emit(
      stage,
    );

    this.showStageDropdown =
      false;

    this.stageSearchTerm = '';
  }


  clearSelectedStage(): void {
    this.stageSelected.emit(
      null,
    );

    this.stageUsersSelected.emit(
      [],
    );

    this.showStageDropdown =
      false;
  }


  get selectedStageLabel(): string {
    if (!this.selectedStage) {
      return 'Selecciona un stage';
    }

    return this.getStageLabel(
      this.selectedStage,
    );
  }


  get filteredStages(): Stage[] {
    const term =
      this.stageSearchTerm
        .trim()
        .toLowerCase();

    if (!term) {
      return this.stages;
    }

    return this.stages.filter(
      stage => {
        const label =
          this.getStageLabel(
            stage,
          ).toLowerCase();

        const description =
          stage.description
            ?.toLowerCase() ??
          '';

        return (
          label.includes(term) ||
          description.includes(term)
        );
      },
    );
  }


  /* =========================
     GROUP
  ========================= */

  toggleGroupDropdown(): void {
    if (
      this.selectedAction !== 'group'
    ) {
      return;
    }

    this.showGroupDropdown =
      !this.showGroupDropdown;

    this.showUserDropdown =
      false;

    this.showStageDropdown =
      false;

    this.showCityDropdown =
      false;
  }


  selectGroup(
    group: NotificationGroupDto,
  ): void {
    this.selectedGroup = group;
    this.showGroupDropdown = false;
    this.groupSearchTerm = '';

    this.groupSelected.emit(
      group,
    );
  }


  clearSelectedGroup(): void {
    this.selectedGroup = null;
    this.showGroupDropdown = false;

    this.groupSelected.emit(
      null,
    );
  }


  get filteredGroups():
    NotificationGroupDto[] {

    const term =
      this.groupSearchTerm
        .trim()
        .toLowerCase();

    if (!term) {
      return this.groups;
    }

    return this.groups.filter(
      group => {
        const name =
          group.name
            ?.toLowerCase() ??
          '';

        const description =
          group.description
            ?.toLowerCase() ??
          '';

        return (
          name.includes(term) ||
          description.includes(term)
        );
      },
    );
  }


  get selectedGroupLabel(): string {
    return (
      this.selectedGroup?.name ??
      'Selecciona un grupo'
    );
  }


  /* =========================
     ROLE
  ========================= */

  selectRole(
    role: RecipientRole,
  ): void {
    if (
      this.selectedAction !== 'role'
    ) {
      return;
    }

    this.selectedRoleValue =
      role;

    this.roleSelected.emit(
      role,
    );
  }


  isRoleSelected(
    role: RecipientRole,
  ): boolean {
    return (
      this.selectedRoleValue ===
      role
    );
  }


  get roleOptions(): {
    value: RecipientRole;
    label: string;
    description: string;
  }[] {
    return [
      {
        value: 'student',
        label: 'Estudiantes',
        description:
          'Todos los estudiantes',
      },
      {
        value: 'instructor',
        label: 'Instructores',
        description:
          'Todos los instructores',
      },
      {
        value: 'admin',
        label: 'Administradores',
        description:
          'Todos los administradores',
      },
    ];
  }


  /* =========================
     SEGMENT
  ========================= */

  selectSegment(
    segment: RecipientSegment,
  ): void {
    if (
      this.selectedAction !== 'segment'
    ) {
      return;
    }

    this.selectedSegment =
      segment;

    this.segmentSelected.emit(
      segment,
    );
  }


  isSegmentSelected(
    segment: RecipientSegment,
  ): boolean {
    return (
      this.selectedSegment ===
      segment
    );
  }


  /* =========================
     CITY
  ========================= */

  toggleCityDropdown(): void {
    if (
      this.selectedAction !== 'segment' ||
      !this.selectedSegment
    ) {
      return;
    }

    this.showCityDropdown =
      !this.showCityDropdown;

    this.showUserDropdown =
      false;

    this.showStageDropdown =
      false;

    this.showGroupDropdown =
      false;
  }


  selectCity(
    city: RecipientCity,
  ): void {
    if (
      this.selectedAction !== 'segment' ||
      !this.selectedSegment
    ) {
      return;
    }

    this.selectedCity = city;
    this.showCityDropdown = false;

    this.citySelected.emit( city );
  }


  clearSelectedCity(): void {
    this.selectedCity = null;
    this.showCityDropdown = false;

    this.citySelected.emit(
      null,
    );
  }


  isCitySelected(
    city: RecipientCity,
  ): boolean {
    return (
      this.selectedCity === city
    );
  }


  get selectedCityLabel(): string {
    return (
      this.selectedCity ??
      'Todas las ciudades'
    );
  }


  /* =========================
     RESET
  ========================= */

  private resetSelector(): void {
    this.searchTerm = '';
    this.filteredUsers = [];
    this.showUserDropdown = false;
    this.isSearchingUsers = false;
    this.selectedUsers = [];

    this.showStageDropdown = false;
    this.stageSearchTerm = '';

    this.showGroupDropdown = false;
    this.groupSearchTerm = '';
    this.selectedGroup = null;

    this.selectedRoleValue = null;

    this.selectedSegment = null;

    this.selectedCity = null;
    this.showCityDropdown = false;
  }


  /* =========================
     DROPDOWNS
  ========================= */

  private closeDropdowns(): void {
    this.showUserDropdown = false;
    this.showStageDropdown = false;
    this.showGroupDropdown = false;
    this.showCityDropdown = false;
  }


  /* =========================
     HELPERS
  ========================= */

  getUserFullName(
    user: UserDto,
  ): string {
    const firstName =
      user.firstName
        ?.trim() ??
      '';

    const lastName =
      user.lastName
        ?.trim() ??
      '';

    return (
      `${firstName} ${lastName}`
        .trim() ||
      user.email ||
      'Usuario'
    );
  }


  getUserInitials(
    user: UserDto,
  ): string {
    const firstName =
      user.firstName
        ?.trim()
        ?.charAt(0) ??
      '';

    const lastName =
      user.lastName
        ?.trim()
        ?.charAt(0) ??
      '';

    return (
      `${firstName}${lastName}`
        .toUpperCase() ||
      'US'
    );
  }


  getStageLabel(
    stage: Stage,
  ): string {
    const number =
      String(
        stage.number ?? '',
      )
        .replace(/[^0-9.]/g, '')
        .trim();

    if (number) {
      return `Stage ${number}`;
    }

    return (
      stage.description ??
      'Stage'
    );
  }


  /* =========================
     TRACK BY
  ========================= */

  trackByUserId(
    index: number,
    user: UserDto,
  ): number {
    return user.id;
  }


  trackByStageId(
    index: number,
    stage: Stage,
  ): number {
    return stage.id;
  }


  trackByGroupId(
    index: number,
    group: NotificationGroupDto,
  ): number {
    return group.id;
  }


  trackByOption(
    index: number,
    option: SendOption,
  ): string {
    return option;
  }


  trackByRole(
    index: number,
    option: {
      value: RecipientRole;
    },
  ): string {
    return option.value;
  }


  /* =========================
     DESTROY
  ========================= */

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}