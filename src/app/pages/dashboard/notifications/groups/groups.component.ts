import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NotificationGroupService } from '../../../../services/notification-group.service';
import {
  CreateNotificationGroupDto,
  NotificationGroupDto,
} from '../../../../services/dtos/notification.dto';

import {
  ModalDto,
  modalInitializer,
} from '../../../../components/modal/modal.dto';

import { ModalComponent } from '../../../../components/modal/modal.component';
import { UserDto } from '../../../../services/dtos/user.dto';

import { GroupsPaginationComponent } from '../../../../components/notifications-v2/groups-pagination/groups-pagination.component';
import { GroupsTableComponent } from '../../../../components/notifications-v2/groups-table/groups-table.component';
import { GroupsSummaryComponent } from '../../../../components/notifications-v2/groups-summary/groups-summary.component';
import { GroupFormComponent } from '../../../../components/notifications-v2/group-form/group-form.component';

type GroupSidePanel = 'create' | 'edit' | 'members' | null;

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    GroupsPaginationComponent,
    GroupsTableComponent,
    GroupsSummaryComponent,
    GroupFormComponent,
  ],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
})
export class GroupsComponent implements OnInit {
  @ViewChild(GroupFormComponent)
  groupFormComponent?: GroupFormComponent;

  showModal = false;
  loading = false;

  groups: NotificationGroupDto[] = [];
  groupToEdit?: NotificationGroupDto;
  selectedGroup?: NotificationGroupDto;

  groupMembers: UserDto[] = [];
  originalGroupMembers: UserDto[] = [];
  originalGroupMemberIds = new Set<number>();

  activeSidePanel: GroupSidePanel = null;

  modal: ModalDto = modalInitializer();

  searchTerm = '';

  page = 1;
  limit = 10;

  readonly limitOptions = [5, 10, 20, 50];

  constructor(
    private notificationGroupService: NotificationGroupService,
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  /* =========================
     FORM USERS
  ========================= */

  get formSelectedUsers(): UserDto[] {
    return this.groupFormComponent?.selectedUsers ?? [];
  }

  get formSelectedUsersCount(): number {
    return this.formSelectedUsers.length;
  }

  get formGroupName(): string {
    return this.activeSidePanel === 'edit' && this.groupToEdit?.name
      ? this.groupToEdit.name
      : 'Nuevo grupo';
  }

  get showFormMembersBlock(): boolean {
    return this.activeSidePanel === 'create' || this.activeSidePanel === 'edit';
  }

  get displayedFormMembers(): UserDto[] {
    if (this.activeSidePanel !== 'edit') {
      return this.formSelectedUsers;
    }

    const users = new Map<number, UserDto>();

    this.originalGroupMembers.forEach((user) => {
      users.set(user.id, user);
    });

    this.formSelectedUsers.forEach((user) => {
      users.set(user.id, user);
    });

    return Array.from(users.values());
  }

  get displayedFormMembersCount(): number {
    return this.displayedFormMembers.length;
  }

  isOriginalGroupMember(userId: number): boolean {
    return this.originalGroupMemberIds.has(userId);
  }

  isNewGroupMember(userId: number): boolean {
    return (
      this.activeSidePanel === 'edit' &&
      !this.originalGroupMemberIds.has(userId)
    );
  }

  trackByFormUserId(index: number, user: UserDto): number {
    return user.id;
  }

  getUserFullName(user: UserDto): string {
    const fullName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || user.email || 'Usuario';
  }

  getUserInitials(user: UserDto): string {
    const first = user.firstName?.trim().charAt(0) ?? '';
    const last = user.lastName?.trim().charAt(0) ?? '';
    const initials = `${first}${last}`.toUpperCase();

    return initials || user.email?.charAt(0).toUpperCase() || 'U';
  }

  /* =========================
     REMOVE USER
  ========================= */

  removeFormSelectedUser(userId: number): void {
    if (this.activeSidePanel === 'create') {
      this.groupFormComponent?.removeUser(userId);
      return;
    }

    if (
      this.activeSidePanel === 'edit' &&
      !this.isOriginalGroupMember(userId)
    ) {
      this.groupFormComponent?.removeUser(userId);
      return;
    }

    if (
      this.activeSidePanel === 'edit' &&
      this.groupToEdit?.id &&
      this.isOriginalGroupMember(userId)
    ) {
      this.removeExistingGroupMember(this.groupToEdit.id, userId);
    }
  }

  private removeExistingGroupMember(
    groupId: number,
    userId: number,
  ): void {
    this.notificationGroupService
      .removeUsersFromGroup(groupId, [userId])
      .subscribe({
        next: () => {
          this.originalGroupMembers =
            this.originalGroupMembers.filter(
              (user) => user.id !== userId,
            );

          this.originalGroupMemberIds.delete(userId);

          this.groupFormComponent?.removeUser(userId);

          this.loadGroups();
        },

        error: (err) => {
          console.error(
            'Error al eliminar integrante del grupo:',
            err,
          );

          this.showRemoveMemberError();
        },
      });
  }

  private showRemoveMemberError(): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      title: 'No se pudo eliminar',
      message:
        'No fue posible eliminar al integrante del grupo. Intenta nuevamente.',
      isError: true,
      close: () => {
        this.modal.show = false;
        this.modal = modalInitializer();
      },
    };
  }

  /* =========================
     CREATE
  ========================= */

  openCreateGroup(): void {
    this.groupToEdit = undefined;
    this.selectedGroup = undefined;
    this.groupMembers = [];
    this.originalGroupMembers = [];
    this.originalGroupMemberIds.clear();
    this.activeSidePanel = 'create';
  }

  /* =========================
     EDIT
  ========================= */

  openEditGroup(group: NotificationGroupDto): void {
    this.selectedGroup = undefined;
    this.groupMembers = [];
    this.originalGroupMembers = [];
    this.originalGroupMemberIds.clear();

    this.notificationGroupService
      .getGroupById(group.id)
      .subscribe({
        next: (fullGroup) => {
          this.groupToEdit = fullGroup;
          this.activeSidePanel = 'edit';

          this.notificationGroupService
            .getUsersByGroupId(group.id)
            .subscribe({
              next: (users) => {
                this.originalGroupMembers = users ?? [];

                this.originalGroupMemberIds = new Set(
                  this.originalGroupMembers.map(
                    (user) => user.id,
                  ),
                );
              },

              error: (err) => {
                console.error(
                  'Error al obtener integrantes existentes:',
                  err,
                );

                this.originalGroupMembers = [];
                this.originalGroupMemberIds.clear();
              },
            });
        },

        error: (err) => {
          console.error(
            'Error al obtener grupo completo:',
            err,
          );
        },
      });
  }

  /* =========================
     MEMBERS
  ========================= */

  openGroupMembersModal(group: NotificationGroupDto): void {
    this.groupToEdit = undefined;
    this.selectedGroup = group;
    this.groupMembers = [];
    this.activeSidePanel = 'members';

    this.notificationGroupService
      .getUsersByGroupId(group.id)
      .subscribe({
        next: (users) => {
          this.groupMembers = users ?? [];
        },

        error: (err) => {
          console.error(
            'Error al obtener integrantes del grupo:',
            err,
          );

          this.groupMembers = [];
        },
      });
  }

  /* =========================
     CLOSE
  ========================= */

  closeSidePanel(): void {
    this.activeSidePanel = null;
    this.selectedGroup = undefined;
    this.groupToEdit = undefined;
    this.groupMembers = [];
    this.originalGroupMembers = [];
    this.originalGroupMemberIds.clear();
  }

  closeModal(): void {
    this.showModal = false;
    this.groupToEdit = undefined;
    this.closeSidePanel();
  }

  /* =========================
     LOAD GROUPS
  ========================= */

  loadGroups(): void {
    this.loading = true;

    this.notificationGroupService
      .getGroups()
      .subscribe({
        next: (res) => {
          this.groups = res.notificationGroups;
          this.page = 1;
          this.loading = false;
        },

        error: (err) => {
          console.error(
            'Error al obtener grupos',
            err,
          );

          this.loading = false;
        },
      });
  }

  /* =========================
     FORM SUBMIT
  ========================= */

  handleFormSubmit(
    event: {
      payload: CreateNotificationGroupDto;
      id?: number;
    },
  ): void {
    if (event.id) {
      const payload: CreateNotificationGroupDto = {
        ...event.payload,

        /*
         * Conservamos integrantes existentes
         * y agregamos los nuevos.
         */
        userIds: this.mergeExistingAndSelectedUsers(
          event.payload.userIds ?? [],
        ),
      };

      this.notificationGroupService
        .updateGroup(
          event.id,
          payload,
        )
        .subscribe({
          next: () => {
            this.showModalMessage({
              title: 'Grupo actualizado',
              message:
                'El grupo fue actualizado correctamente.',
              isSuccess: true,
            });
          },

          error: () => {
            this.showModalMessage({
              title: 'Error al actualizar',
              message:
                'No se pudo actualizar el grupo.',
              isError: true,
            });
          },
        });

      return;
    }

    this.notificationGroupService
      .createGroup(event.payload)
      .subscribe({
        next: () => {
          this.showModalMessage({
            title: 'Grupo creado',
            message:
              'El grupo fue creado correctamente.',
            isSuccess: true,
          });
        },

        error: () => {
          this.showModalMessage({
            title: 'Error al crear',
            message:
              'No se pudo crear el grupo.',
            isError: true,
          });
        },
      });
  }

  private mergeExistingAndSelectedUsers(
    selectedUserIds: number[],
  ): number[] {
    const existingIds =
      this.originalGroupMembers.map(
        (user) => user.id,
      );

    return Array.from(
      new Set([
        ...existingIds,
        ...selectedUserIds,
      ]),
    );
  }

  /* =========================
     ADD USERS
  ========================= */

  onAddUsers({
    groupId,
    userIds,
  }: {
    groupId: number;
    userIds: number[];
  }): void {
    this.notificationGroupService
      .addUsersToGroup(groupId, userIds)
      .subscribe({
        next: () => {
          this.notificationGroupService
            .getUsersByGroupId(groupId)
            .subscribe({
              next: (updatedUsers) => {
                this.groupMembers = updatedUsers;
                this.loadGroups();
              },

              error: (err) => {
                console.error(
                  'Error al actualizar miembros del grupo:',
                  err,
                );
              },
            });
        },

        error: (err) => {
          console.error(
            'Error al agregar usuarios desde el padre',
            err,
          );
        },
      });
  }

  get originalGroupMemberIdsArray(): number[] {
    return Array.from(
      this.originalGroupMemberIds,
    );
  }

  /* =========================
     MODAL MESSAGE
  ========================= */

  private showModalMessage({
    title,
    message,
    isSuccess = false,
    isError = false,
  }: {
    title: string;
    message: string;
    isSuccess?: boolean;
    isError?: boolean;
  }): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      title,
      message,
      isSuccess,
      isError,
      close: () => {
        this.modal.show = false;
        this.modal = modalInitializer();
      },
    };

    setTimeout(() => {
      this.modal.show = false;
      this.modal = modalInitializer();
    }, 2000);

    this.closeSidePanel();
    this.loadGroups();
  }

  /* =========================
     LEGACY MEMBERS
  ========================= */

  openGroupMembers(group: NotificationGroupDto): void {
    this.openGroupMembersModal(group);
  }

  closeMembersModal(): void {
    this.closeSidePanel();
  }

  /* =========================
     DELETE GROUP
  ========================= */

  onRequestDelete(group: NotificationGroupDto): void {
    this.openConfirmDelete(group);
  }

  private openConfirmDelete(
    group: NotificationGroupDto,
  ): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      title: 'Eliminar grupo',
      message:
        '¿Deseas eliminar el grupo? Esta acción no se puede deshacer.',
      isInfo: true,
      showButtons: true,
      close: () => {
        this.modal.show = false;
      },
      confirm: () =>
        this.confirmDelete(group.id),
    };
  }

  private confirmDelete(
    groupId: number,
  ): void {
    this.modal.show = false;

    this.notificationGroupService
      .deleteGroup(groupId)
      .subscribe({
        next: () => {
          this.showModalMessage({
            title: 'Grupo eliminado',
            message:
              'El grupo fue eliminado correctamente.',
            isSuccess: true,
          });

          this.loadGroups();
        },

        error: () => {
          this.showModalMessage({
            title: 'Error al eliminar',
            message:
              'No se pudo eliminar el grupo. Intenta nuevamente.',
            isError: true,
          });
        },
      });
  }

  /* =========================
     SEARCH
  ========================= */

  get filteredGroups(): NotificationGroupDto[] {
    const query =
      this.searchTerm.trim().toLowerCase();

    if (!query) {
      return this.groups;
    }

    return this.groups.filter((group) => {
      const name =
        group.name?.toLowerCase() ?? '';

      const description =
        group.description?.toLowerCase() ?? '';

      return (
        name.includes(query) ||
        description.includes(query)
      );
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.page = 1;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.page = 1;
  }

  /* =========================
     PAGINATION
  ========================= */

  get pagedGroups(): NotificationGroupDto[] {
    const start =
      (this.page - 1) * this.limit;

    return this.filteredGroups.slice(
      start,
      start + this.limit,
    );
  }

  get total(): number {
    return this.filteredGroups.length;
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(
        this.total / this.limit,
      ),
    );
  }

  get canPrev(): boolean {
    return this.page > 1;
  }

  get canNext(): boolean {
    return this.page < this.totalPages;
  }

  get startIndex(): number {
    if (!this.total) {
      return 0;
    }

    return (
      (this.page - 1) *
        this.limit +
      1
    );
  }

  get endIndex(): number {
    return Math.min(
      this.page * this.limit,
      this.total,
    );
  }

  onPrev(): void {
    if (!this.canPrev) {
      return;
    }

    this.page--;
  }

  onNext(): void {
    if (!this.canNext) {
      return;
    }

    this.page++;
  }

  onPageChange(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.page
    ) {
      return;
    }

    this.page = page;
  }

  onLimitChange(value: number): void {
    const limit = Number(value);

    if (
      !Number.isFinite(limit) ||
      limit <= 0
    ) {
      return;
    }

    this.limit = limit;
    this.page = 1;
  }
}