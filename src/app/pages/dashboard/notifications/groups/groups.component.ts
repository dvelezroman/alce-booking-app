import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupFormComponent } from '../../../../components/notifications/form-group/group-form.component';
import { GroupListComponent } from '../../../../components/notifications/group-list/group-list.component';
import { NotificationGroupService } from '../../../../services/notification-group.service';
import { CreateNotificationGroupDto, NotificationGroupDto } from '../../../../services/dtos/notification.dto';
import { ModalDto, modalInitializer } from '../../../../components/modal/modal.dto';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { GroupMembersModalComponent } from '../../../../components/notifications/group-members-modal/group-members-modal.component';
import { UserDto } from '../../../../services/dtos/user.dto';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GroupFormComponent,
    GroupListComponent,
    ModalComponent,
    GroupMembersModalComponent
  ],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
})
export class GroupsComponent implements OnInit {
  showModal = false;
  groups: NotificationGroupDto[] = [];
  loading = false;
  groupToEdit?: NotificationGroupDto;
  modal: ModalDto = modalInitializer();
  showMembersModal = false;
  selectedGroup?: NotificationGroupDto;
  groupMembers: UserDto[] = [];

  constructor(private notificationGroupService: NotificationGroupService,
   ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  openCreateGroup() {
    this.groupToEdit = undefined;
    this.showModal = true;
  }

  openEditGroup(group: NotificationGroupDto) {
    this.notificationGroupService.getGroupById(group.id).subscribe({
      next: (fullGroup) => {
        this.groupToEdit = fullGroup;
        this.showModal = true;
      },
      error: (err) => {
        console.error('Error al obtener grupo completo:', err);
      },
    }); 
  }

  openGroupMembersModal(group: NotificationGroupDto) {
    this.selectedGroup = group;

    this.notificationGroupService.getUsersByGroupId(group.id).subscribe({
      next: (users) => {
        this.groupMembers = users;
        this.showMembersModal = true;
      },
      error: (err) => {
        console.error('Error al obtener integrantes del grupo:', err);
        this.groupMembers = [];
      },
    });
  }
  

  closeModal() {
    this.showModal = false;
    this.groupToEdit = undefined;
  }

  loadGroups() {
    this.loading = true;
    this.notificationGroupService.getGroups().subscribe({
      next: (res) => {
        this.groups = res.notificationGroups;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener grupos', err);
        this.loading = false;
      },
    });
  }

  handleFormSubmit(event: {
    payload: CreateNotificationGroupDto;
    id?: number;
  }) {
    if (event.id) {
      // EDITAR
      this.notificationGroupService.updateGroup(event.id, event.payload).subscribe({
        next: () => {
          this.showModalMessage({
            title: 'Grupo actualizado',
            message: 'El grupo fue actualizado correctamente.',
            isSuccess: true,
          });
        },
        error: () => {
          this.showModalMessage({
            title: 'Error al actualizar',
            message: 'No se pudo actualizar el grupo.',
            isError: true,
          });
        },
      });
    } else {
      // CREAR
      this.notificationGroupService.createGroup(event.payload).subscribe({
        next: () => {
          this.showModalMessage({
            title: 'Grupo creado',
            message: 'El grupo fue creado correctamente.',
            isSuccess: true,
          });
        },
        error: () => {
          this.showModalMessage({
            title: 'Error al crear',
            message: 'No se pudo crear el grupo.',
            isError: true,
          });
        },
      });
    }
  }

  onAddUsers({ groupId, userIds }: { groupId: number; userIds: number[] }) {
    this.notificationGroupService.addUsersToGroup(groupId, userIds).subscribe({
      next: () => {

        this.notificationGroupService.getUsersByGroupId(groupId).subscribe({
          next: (updatedUsers) => {
            this.groupMembers = updatedUsers;
            this.loadGroups();
          },
          error: (err) => {
            console.error('Error al actualizar miembros del grupo:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error al agregar usuarios desde el padre', err);
      }
    });
  }

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
  }) {
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

    this.closeModal();
    this.loadGroups();
  }

  openGroupMembers(group: NotificationGroupDto) {
    this.selectedGroup = group;
    this.showMembersModal = true;
  }

  closeMembersModal() {
    this.showMembersModal = false;
    this.selectedGroup = undefined;
  }
}