import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationGroupDto } from '../../../services/dtos/notification.dto';
import { NotificationGroupService } from '../../../services/notification-group.service';
import { UserDto } from '../../../services/dtos/user.dto';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { UserSelectorComponent } from '../user-selector/user-selector.component';
import { ModalDto, modalInitializer } from '../../modal/modal.dto';
import { ModalComponent } from '../../modal/modal.component';

@Component({
  selector: 'app-group-members-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserSelectorComponent, ModalComponent],
  templateUrl: './group-members-modal.component.html',
  styleUrl: './group-members-modal.component.scss',
})
export class GroupMembersModalComponent {
  @Input() group: NotificationGroupDto | null = null;
  @Input() members: UserDto[] = [];
  @Input() show: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() addUsers = new EventEmitter<{ groupId: number; userIds: number[] }>();

  private notificationGroupService = inject(NotificationGroupService);
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    userIds: [[]],
  });

  selectedRole: 'student' | 'instructor' | null = null;
  selectedUsers: UserDto[] = [];
  modal: ModalDto = modalInitializer();

  onClose() {
    this.close.emit();
  }

  onRoleChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedRole = select.value as 'student' | 'instructor';
    this.selectedUsers = [];
    this.form.get('userIds')?.setValue([]);
  }

  onUsersSelected(users: UserDto[]) {
    const existingUserIds = new Set(this.members.map((u) => u.id));
    const selectedUserIds = users.map((u) => u.id);

    const hasDuplicates = selectedUserIds.some((id) => existingUserIds.has(id));

    if (hasDuplicates) {
      this.showModal({
        title: 'Usuarios ya existentes',
        message: 'Uno o más usuarios seleccionados ya están en el grupo.',
        isError: true,
        duration: 3000,
      });

      // Limpiar selección para evitar guardado incorrecto
      this.selectedUsers = [];
      this.form.get('userIds')?.setValue([]);
      return;
    }

    this.selectedUsers = users;
    this.form.get('userIds')?.setValue(selectedUserIds);
  }

  addUsersToGroup() {
    if (!this.group?.id || this.selectedUsers.length === 0) return;

    const existingUserIds = new Set(this.members.map(u => u.id));
    const newUsers = this.selectedUsers.filter(u => !existingUserIds.has(u.id));

    if (newUsers.length === 0) return;

    const userIds = newUsers.map(u => u.id);

    this.addUsers.emit({ groupId: this.group.id, userIds });
    this.selectedUsers = [];
    this.selectedRole = null;
    this.form.get('userIds')?.setValue([]);
  }

  removeUserFromGroup(userId: number) {
    if (!this.group?.id) return;

    this.notificationGroupService
      .removeUsersFromGroup(this.group.id, [userId])
      .subscribe({
        next: () => {
          this.members = this.members.filter((u) => u.id !== userId);
          this.group!.userIds = this.group!.userIds?.filter(
            (id) => id !== userId
          );
        },
        error: (err) => {
          console.error('Error al eliminar usuario del grupo', err);
        },
      });
  }

  private showModal({ title = '', message = '', isSuccess = false, isError = false , duration = 2000 }: {
    title?: string;
    message?: string;
    isSuccess?: boolean;
    isError?: boolean;
    duration?: number;
  }): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      title,
      message,
      isSuccess,
      isError,
      close: () => (this.modal.show = false),
    };

    setTimeout(() => {
      this.modal.show = false;
    }, duration);
  }
}