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

  constructor(private notificationService: NotificationGroupService) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  openCreateGroup() {
    this.groupToEdit = undefined;
    this.showModal = true;
  }

  openEditGroup(group: NotificationGroupDto) {
    this.notificationService.getGroupById(group.id).subscribe({
      next: (fullGroup) => {
        this.groupToEdit = fullGroup;
        this.showModal = true;
      },
      error: (err) => {
        console.error('Error al obtener grupo completo:', err);
      },
    });
}

  closeModal() {
    this.showModal = false;
    this.groupToEdit = undefined;
  }

  loadGroups() {
    this.loading = true;
    this.notificationService.getGroups().subscribe({
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
      this.notificationService.updateGroup(event.id, event.payload).subscribe({
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
      this.notificationService.createGroup(event.payload).subscribe({
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