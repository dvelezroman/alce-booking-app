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
  UserDto,
  UserRole,
} from '../../../services/dtos/user.dto';

import {
  Stage,
} from '../../../services/dtos/student.dto';

import {
  NotificationGroupDto,
} from '../../../services/dtos/notification.dto';

import {
  UsersService,
} from '../../../services/users.service';


export type EmailRecipientType =
  | 'user'
  | 'stage'
  | 'group'
  | 'role';

  type StageRecipientFilter =
  | 'valid'
  | 'with-email'
  | 'all';

  type UserRecipientSource =
  | 'platform'
  | 'external';


@Component({
  selector: 'app-email-recipient-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl:
    './email-recipient-form.component.html',
  styleUrl:
    './email-recipient-form.component.scss',
})
export class EmailRecipientFormComponent
  implements OnChanges {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  selectedType:
    EmailRecipientType | '' = 'user';

  @Input()
  stages: Stage[] = [];

  @Input()
  groups: NotificationGroupDto[] = [];

  @Input()
  userRole:
    UserRole | null = null;

  @Input()
  reset = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() userSelected = new EventEmitter<UserDto | null>();

  @Output() externalEmailSelected = new EventEmitter<string | null>();

  @Output() stageSelected = new EventEmitter<Stage | null>();

  @Output() stageUsersLoaded = new EventEmitter<UserDto[]>();

  @Output() groupSelected = new EventEmitter<NotificationGroupDto | null>();

  @Output() roleUsersLoaded = new EventEmitter<UserDto[]>();

  @Output() roleSelected = new EventEmitter<
    'student'
    | 'instructor'
    | 'admin'
    | null
  >();


  /* =========================
     USER
  ========================= */

  userRecipientSource:
  UserRecipientSource = 'platform';
  externalEmail = '';
  userSearch = '';
  users: UserDto[] = [];
  loadingUsers = false;
  showUserDropdown = false;
  selectedUser: UserDto | null = null;

  private searchTimer: ReturnType<typeof setTimeout> | null = null;


  /* =========================
     STAGE
  ========================= */

  selectedStageId:
    number | null = null;

  stageUsers: UserDto[] = [];
  loadingStageUsers = false;
  stageRecipientFilter: StageRecipientFilter = 'valid';


  /* =========================
     GROUP
  ========================= */

  selectedGroupId:
    number | null = null;


  /* =========================
     ROLE
  ========================= */

  selectedRole:
    'student'
    | 'instructor'
    | 'admin'
    | null = null;

  roleUsers: UserDto[] = [];

  loadingRoleUsers = false;


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private usersService: UsersService,
  ) {}


  /* =========================
     CHANGES
  ========================= */

  ngOnChanges(
    changes: SimpleChanges,
  ): void {

    if (
      changes['reset'] &&
      this.reset
    ) {
      this.resetForm();
    }

    if (
      changes['selectedType'] &&
      !changes['selectedType'].firstChange
    ) {
      this.clearCurrentSelection();
    }
  }

  /* =========================
   USER RECIPIENT SOURCE
========================= */

selectUserRecipientSource(
  source: UserRecipientSource,
): void {

  if (
    this.userRecipientSource === source
  ) {
    return;
  }

  this.userRecipientSource =
    source;

  if (
    source === 'platform'
  ) {

    this.externalEmail = '';

    this.externalEmailSelected.emit(
      null,
    );

    return;
  }

  this.selectedUser =
    null;

  this.userSearch =
    '';

  this.users =
    [];

  this.showUserDropdown =
    false;

  this.userSelected.emit(
    null,
  );
}


  /* =========================
    EXTERNAL EMAIL
  ========================= */

  onExternalEmailChange(
    value: string,
  ): void {

    this.externalEmail =
      value;

    const email =
      value.trim();

    if (
      !this.isValidEmail(email)
    ) {
      this.externalEmailSelected.emit(
        null,
      );

      return;
    }

    this.externalEmailSelected.emit(
      email,
    );
  }


  clearExternalEmail(): void {

    this.externalEmail =
      '';

    this.externalEmailSelected.emit(
      null,
    );
  }


  get externalEmailHasValue(): boolean {

    return (
      this.externalEmail
        .trim()
        .length > 0
    );
  }


  get externalEmailIsValid(): boolean {

    return this.isValidEmail(
      this.externalEmail,
    );
  }


  get externalEmailStatus():
    'valid'
    | 'invalid'
    | 'empty' {

    if (
      !this.externalEmailHasValue
    ) {
      return 'empty';
    }

    return this.externalEmailIsValid
      ? 'valid'
      : 'invalid';
  }


  get externalEmailStatusLabel(): string {

    switch (
      this.externalEmailStatus
    ) {

      case 'valid':
        return 'Email válido';

      case 'invalid':
        return 'Email inválido';

      default:
        return '';
    }
  }


  /* =========================
     USER SEARCH
  ========================= */

  onUserSearchChange(
    value: string,
  ): void {

    this.userSearch = value;

    if (
      this.searchTimer
    ) {
      clearTimeout(
        this.searchTimer,
      );
    }

    const query =
      value
        .trim()
        .toLowerCase();

    if (
      query.length < 2
    ) {
      this.users = [];
      this.showUserDropdown = false;
      this.loadingUsers = false;

      return;
    }

    this.loadingUsers = true;

    this.searchTimer =
      setTimeout(
        () => {
          this.searchUsers(
            query,
          );
        },
        700,
      );
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
      )
      .subscribe({
        next: (result) => {

          this.users =
            result.users ?? [];

          this.showUserDropdown =
            true;

          this.loadingUsers =
            false;
        },

        error: () => {

          this.users = [];

          this.showUserDropdown =
            false;

          this.loadingUsers =
            false;
        },
      });
  }


  /* =========================
     SELECT USER
  ========================= */

  selectUser(
    user: UserDto,
  ): void {

    this.selectedUser =
      user;

    this.userSearch =
      this.getUserName(
        user,
      );

    this.users = [];

    this.showUserDropdown =
      false;

    this.userSelected.emit(
      user,
    );
  }


  /* =========================
     CLEAR USER
  ========================= */

  clearSelectedUser(): void {

    this.selectedUser =
      null;

    this.userSearch =
      '';

    this.users =
      [];

    this.showUserDropdown =
      false;

    this.userSelected.emit(
      null,
    );
  }


  hideUserDropdown(): void {

    setTimeout(
      () => {
        this.showUserDropdown =
          false;
      },
      150,
    );
  }


  /* =========================
    USER EMAIL
  ========================= */

  get selectedUserEmail(): string {
    if (!this.selectedUser) {
      return '';
    }

    return (
      this.getUserValidEmail(
        this.selectedUser,
      ) ?? ''
    );
  }


  get selectedUserHasAnyEmailValue(): boolean {
    if (!this.selectedUser) {
      return false;
    }

    return Boolean(
      this.selectedUser.student?.tutorEmail?.trim() ||
      this.selectedUser.emailAddress?.trim() ||
      this.selectedUser.email?.trim()
    );
  }


  get selectedUserHasEmail(): boolean {
    return this.selectedUserEmail.length > 0;
  }


  get selectedUserEmailIsValid(): boolean {
    return this.selectedUserHasEmail;
  }


  get selectedUserEmailStatus():
    'valid'
    | 'invalid'
    | 'missing' {

    if (!this.selectedUser) {
      return 'missing';
    }

    /*
    * Si getUserValidEmail encontró alguno válido:
    * 1. emailAddress
    * 2. email
    */
    if (this.selectedUserHasEmail) {
      return 'valid';
    }

    /*
    * Tiene algún valor registrado,
    * pero ninguno tiene formato de email válido.
    */
    if (this.selectedUserHasAnyEmailValue) {
      return 'invalid';
    }

    /*
    * No tiene valor ni en emailAddress
    * ni en email.
    */
    return 'missing';
  }


  get selectedUserEmailStatusLabel(): string {
    switch (this.selectedUserEmailStatus) {
      case 'valid':
        return 'Email válido';

      case 'invalid':
        return 'Email inválido';

      default:
        return 'Sin email';
    }
  }


  get selectedUserEmailMessage(): string {
    switch (this.selectedUserEmailStatus) {
      case 'valid':
        return 'El usuario tiene un email válido y puede recibir notificaciones.';

      case 'invalid':
        return 'Los datos de email registrados no contienen un correo válido.';

      default:
        return 'Este usuario no tiene un email registrado.';
    }
  }


  private isValidEmail(
    email?: string | null,
  ): boolean {
    if (!email?.trim()) {
      return false;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(email.trim());
  }


  getUserValidEmail(
    user: UserDto,
  ): string | null {

    const tutorEmail =
      user.student
        ?.tutorEmail
        ?.trim();

    if (
      tutorEmail &&
      this.isValidEmail(tutorEmail)
    ) {
      return tutorEmail;
    }


    const emailAddress =
      user.emailAddress
        ?.trim();

    if (
      emailAddress &&
      this.isValidEmail(emailAddress)
    ) {
      return emailAddress;
    }


    const email =
      user.email
        ?.trim();

    if (
      email &&
      this.isValidEmail(email)
    ) {
      return email;
    }


    return null;
  }


  /* =========================
     STAGE
  ========================= */

  onStageChange(
    value: number | null,
  ): void {

    this.selectedStageId =
      value;

    this.stageUsers = [];

    this.stageUsersLoaded.emit(
      [],
    );

    if (value === null) {
      this.stageSelected.emit(
        null,
      );

      return;
    }

    const stage =
      this.stages.find(
        item =>
          item.id === Number(value),
      ) ?? null;

    this.stageSelected.emit(
      stage,
    );

    this.loadStageUsers(
      Number(value),
    );
  }

  private loadStageUsers(
    stageId: number,
  ): void {

    this.loadingStageUsers = true;

    this.usersService
      .searchUsers(
        undefined,
        undefined,
        undefined,
        '',
        '',
        undefined,
        UserRole.STUDENT,
        true,
        stageId,
      )
      .subscribe({
        next: (response) => {

          this.stageUsers =
            response.users ?? [];

          this.loadingStageUsers =
            false;

          this.stageUsersLoaded.emit(
            this.stageUsers,
          );

          console.log(
            'STAGE USERS:',
            {
              stageId,
              totalBackend: response.total,
              recibidos: this.stageUsers.length,
              validos:
                this.stageUsersValidEmailCount,
              invalidos:
                this.stageUsersInvalidEmailCount,
              sinEmail:
                this.stageUsersWithoutEmailCount,
            },
          );
        },

        error: (error) => {

          console.error(
            'Error al obtener usuarios del Stage:',
            error,
          );

          this.stageUsers = [];

          this.loadingStageUsers =
            false;

          this.stageUsersLoaded.emit(
            [],
          );
        },
      });
  }

  get selectedStageLabel(): string {
    if (this.selectedStageId === null) {
      return '';
    }

    const stage =
      this.stages.find(
        item =>
          item.id ===
          this.selectedStageId,
      );

    if (!stage) {
      return '';
    }

    return this.getStageLabel(stage);
  }

  get stageUsersTotal(): number {
    return this.stageUsers.length;
  }


  get stageUsersWithValidEmail(): UserDto[] {
    return this.stageUsers.filter(
      user =>
        this.getUserValidEmail(user) !== null,
    );
  }


  get stageUsersValidEmailCount(): number {
    return this.stageUsersWithValidEmail.length;
  }


  get stageUsersWithInvalidEmail(): UserDto[] {
    return this.stageUsers.filter(
      user =>
        !this.getUserValidEmail(user) &&
        this.userHasAnyEmailValue(user),
    );
  }


  get stageUsersInvalidEmailCount(): number {
    return this.stageUsersWithInvalidEmail.length;
  }


  get stageUsersWithoutEmail(): UserDto[] {
    return this.stageUsers.filter(
      user =>
        !this.getUserValidEmail(user) &&
        !this.userHasAnyEmailValue(user),
    );
  }


  get stageUsersWithoutEmailCount(): number {
    return this.stageUsersWithoutEmail.length;
  }

  get stageValidEmailPercentage(): number {
    if (!this.stageUsersTotal) {
      return 0;
    }

    return (
      this.stageUsersValidEmailCount /
      this.stageUsersTotal
    ) * 100;
  }


  get stageInvalidEmailPercentage(): number {
    if (!this.stageUsersTotal) {
      return 0;
    }

    return (
      this.stageUsersInvalidEmailCount /
      this.stageUsersTotal
    ) * 100;
  }


  get stageWithoutEmailPercentage(): number {
    if (!this.stageUsersTotal) {
      return 0;
    }

    return (
      this.stageUsersWithoutEmailCount /
      this.stageUsersTotal
    ) * 100;
  }

  get stageFilteredRecipientsCount(): number {
    switch (this.stageRecipientFilter) {
      case 'valid':
        return this.stageUsersValidEmailCount;

      case 'with-email':
        return (
          this.stageUsersValidEmailCount +
          this.stageUsersInvalidEmailCount
        );

      case 'all':
        return this.stageUsersTotal;

      default:
        return 0;
    }
  }


  /* =========================
     GROUP
  ========================= */

  onGroupChange(
    value: number | null,
  ): void {

    this.selectedGroupId =
      value === null
        ? null
        : Number(value);

    if (
      this.selectedGroupId === null
    ) {
      this.groupSelected.emit(
        null,
      );

      return;
    }

    const group =
      this.groups.find(
        item =>
          item.id ===
          this.selectedGroupId,
      ) ?? null;

    this.groupSelected.emit(
      group,
    );
  }

  /* =========================
    GROUP USERS
  ========================= */

  get selectedGroup(): NotificationGroupDto | null {
    if (this.selectedGroupId === null) {
      return null;
    }

    return (
      this.groups.find(
        group =>
          group.id ===
          this.selectedGroupId,
      ) ?? null
    );
  }


  get groupUsers(): UserDto[] {
    return this.selectedGroup?.users ?? [];
  }


  get groupUsersTotal(): number {
    return this.groupUsers.length;
  }


  get groupUsersWithValidEmail(): UserDto[] {
    return this.groupUsers.filter(
      user =>
        this.getUserValidEmail(user) !== null,
    );
  }


  get groupUsersValidEmailCount(): number {
    return this.groupUsersWithValidEmail.length;
  }


  get groupUsersWithInvalidEmail(): UserDto[] {
    return this.groupUsers.filter(
      user =>
        !this.getUserValidEmail(user) &&
        this.userHasAnyEmailValue(user),
    );
  }


  get groupUsersInvalidEmailCount(): number {
    return this.groupUsersWithInvalidEmail.length;
  }


  get groupUsersWithoutEmail(): UserDto[] {
    return this.groupUsers.filter(
      user =>
        !this.getUserValidEmail(user) &&
        !this.userHasAnyEmailValue(user),
    );
  }


  get groupUsersWithoutEmailCount(): number {
    return this.groupUsersWithoutEmail.length;
  }

    get groupValidEmailPercentage(): number {
    if (!this.groupUsersTotal) {
      return 0;
    }

    return (
      this.groupUsersValidEmailCount /
      this.groupUsersTotal
    ) * 100;
  }


  get groupInvalidEmailPercentage(): number {
    if (!this.groupUsersTotal) {
      return 0;
    }

    return (
      this.groupUsersInvalidEmailCount /
      this.groupUsersTotal
    ) * 100;
  }


  get groupWithoutEmailPercentage(): number {
    if (!this.groupUsersTotal) {
      return 0;
    }

    return (
      this.groupUsersWithoutEmailCount /
      this.groupUsersTotal
    ) * 100;
  }


  /* =========================
     ROLE
  ========================= */

  selectRole(
    role:
      'student'
      | 'instructor'
      | 'admin',
  ): void {

    this.selectedRole = role;

    this.roleSelected.emit(
      role,
    );

    this.roleUsers = [];

    this.roleUsersLoaded.emit(
      [],
    );

    this.loadRoleUsers(
      role,
    );
  }

  private loadRoleUsers(
    role:
      'student'
      | 'instructor'
      | 'admin',
  ): void {

    this.loadingRoleUsers = true;

    const userRole =
      this.mapRecipientRoleToUserRole(
        role,
      );

    this.usersService
      .searchUsers(
        undefined,
        undefined,
        undefined,
        '',
        '',
        undefined,
        userRole,
        true,
        undefined,
      )
      .subscribe({
        next: (response) => {

          this.roleUsers =
            response.users ?? [];

          this.loadingRoleUsers =
            false;

          /* ENVIAR USUARIOS AL PADRE */
          this.roleUsersLoaded.emit(
            this.roleUsers,
          );

          console.log(
            'ROLE USERS:',
            {
              role,
              totalBackend: response.total,
              recibidos: this.roleUsers.length,
              validos: this.roleUsersValidEmailCount,
              invalidos: this.roleUsersInvalidEmailCount,
              sinEmail: this.roleUsersWithoutEmailCount,
            },
          );
        },

        error: (error) => {

          console.error(
            'Error al obtener usuarios por rol:',
            error,
          );

          this.roleUsers = [];
          this.loadingRoleUsers = false;

          /* LIMPIAR TAMBIÉN EN EL PADRE */
          this.roleUsersLoaded.emit(
            [],
          );
        },
      });
  }

  private mapRecipientRoleToUserRole(
    role:
      'student'
      | 'instructor'
      | 'admin',
  ): UserRole {

    switch (role) {

      case 'student':
        return UserRole.STUDENT;

      case 'instructor':
        return UserRole.INSTRUCTOR;

      case 'admin':
        return UserRole.ADMIN;
    }
  }

  /* =========================
    ROLE EMAIL SUMMARY
  ========================= */

  get roleUsersTotal(): number {
    return this.roleUsers.length;
  }


  get roleUsersWithValidEmail(): UserDto[] {

    return this.roleUsers.filter(
      user =>
        this.getUserValidEmail(
          user,
        ) !== null,
    );
  }


  get roleUsersValidEmailCount(): number {

    return this.roleUsersWithValidEmail
      .length;
  }


  get roleUsersWithInvalidEmail(): UserDto[] {

    return this.roleUsers.filter(
      user =>
        !this.getUserValidEmail(
          user,
        ) &&
        this.userHasAnyEmailValue(
          user,
        ),
    );
  }


  get roleUsersInvalidEmailCount(): number {

    return this.roleUsersWithInvalidEmail
      .length;
  }


  get roleUsersWithoutEmail(): UserDto[] {

    return this.roleUsers.filter(
      user =>
        !this.getUserValidEmail(
          user,
        ) &&
        !this.userHasAnyEmailValue(
          user,
        ),
    );
  }


  get roleUsersWithoutEmailCount(): number {

    return this.roleUsersWithoutEmail
      .length;
  }

  get roleValidEmailPercentage(): number {

    if (!this.roleUsersTotal) {
      return 0;
    }

    return (
      this.roleUsersValidEmailCount /
      this.roleUsersTotal
    ) * 100;
  }


  get roleInvalidEmailPercentage(): number {

    if (!this.roleUsersTotal) {
      return 0;
    }

    return (
      this.roleUsersInvalidEmailCount /
      this.roleUsersTotal
    ) * 100;
  }


  get roleWithoutEmailPercentage(): number {

    if (!this.roleUsersTotal) {
      return 0;
    }

    return (
      this.roleUsersWithoutEmailCount /
      this.roleUsersTotal
    ) * 100;
  }

  get selectedRoleLabel(): string {

    switch (
      this.selectedRole
    ) {

      case 'student':
        return 'Estudiantes';

      case 'instructor':
        return 'Instructores';

      case 'admin':
        return 'Administradores';

      default:
        return '';
    }
  }


  /* =========================
     HELPERS
  ========================= */
  private userHasAnyEmailValue(
    user: UserDto,
  ): boolean {

    return Boolean(
      user.student?.tutorEmail?.trim() ||
      user.emailAddress?.trim() ||
      user.email?.trim()
    );
  }

  getUserName(
    user: UserDto,
  ): string {

    const fullName =
      [
        user.firstName,
        user.lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

    return (
      fullName ||
      user.email ||
      'Usuario'
    );
  }


  getUserInitials(
    user: UserDto,
  ): string {

    const first =
      user.firstName
        ?.trim()
        .charAt(0) ??
      '';

    const last =
      user.lastName
        ?.trim()
        .charAt(0) ??
      '';

    return (
      `${first}${last}`
        .toUpperCase() ||
      user.email
        ?.charAt(0)
        .toUpperCase() ||
      'U'
    );
  }

  getUserRoleLabel(
    user: UserDto,
  ): string {
    switch (user.role) {
      case UserRole.STUDENT:
        return 'Estudiante';

      case UserRole.INSTRUCTOR:
        return 'Instructor';

      case UserRole.ADMIN:
        return 'Administrador';

      default:
        return 'Usuario';
    }
  }


  getStageLabel(
    stage: Stage,
  ): string {

    return (
      stage.description ||
      `Stage ${stage.id}`
    );
  }


  getGroupLabel(
    group: NotificationGroupDto,
  ): string {

    return (
      group.name ||
      `Grupo ${group.id}`
    );
  }


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


  /* =========================
     RESET
  ========================= */

  private clearCurrentSelection(): void {

    this.userRecipientSource = 'platform';
    this.externalEmail = '';

    this.selectedUser = null;
    this.userSearch = '';
    this.users = [];
    this.showUserDropdown = false;

    this.selectedStageId = null;
    this.stageUsers = [];
    this.loadingStageUsers = false;

    this.selectedGroupId = null;

    this.selectedRole = null;
    this.roleUsers = [];
    this.loadingRoleUsers = false;

    this.userSelected.emit(null);
    this.stageSelected.emit(null);
    this.stageUsersLoaded.emit([]);
    this.roleSelected.emit(null);
    this.roleUsersLoaded.emit([]);
    this.groupSelected.emit(null);
  }


  private resetForm(): void {
    this.clearCurrentSelection();
  }
}