import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserSelectorComponent } from '../user-selector/user-selector.component';
import { UserDto } from '../../../services/dtos/user.dto';
import {
  CreateNotificationGroupDto,
  NotificationGroupDto,
} from '../../../services/dtos/notification.dto';
import { NotificationGroupService } from '../../../services/notification-group.service';

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserSelectorComponent],
  templateUrl: './group-form.component.html',
  styleUrl: './group-form.component.scss',
})
export class GroupFormComponent implements OnChanges {
  form: FormGroup;
  selectedRole: 'student' | 'instructor' | null = null;
  selectedUsers: UserDto[] = [];
  members: UserDto[] = [];

  @Input() groupToEdit?: NotificationGroupDto;
  @Output() formSubmitted = new EventEmitter<{
    payload: CreateNotificationGroupDto;
    id?: number;
  }>();

  constructor(
    private fb: FormBuilder,
    private notificationGroupService: NotificationGroupService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      userIds: [[], Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['groupToEdit'] && this.groupToEdit) {
      this.form.patchValue({
        name: this.groupToEdit.name,
        description: this.groupToEdit.description,
        userIds: this.groupToEdit.userIds,
      });

      this.selectedUsers = this.groupToEdit.users || [];
      this.notificationGroupService
        .getUsersByGroupId(this.groupToEdit.id)
        .subscribe({
          next: (users) => {
            this.members = users;
          },
          error: (err) => {
            console.error('Error al obtener miembros:', err);
            this.members = [];
          },
        });
    } else {
      this.form.reset();
      this.selectedUsers = [];
      this.selectedRole = null;
      this.members = [];
    }
  }

  get selectedUserNames(): { id: number; name: string }[] {
    const ids: number[] = this.form.get('userIds')?.value || [];

    return ids.map((id: number) => {
      const user = this.members.find((m) => m.id === id);
      return {
        id,
        name: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
      };
    });
  }

  onRoleChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedRole = selectElement.value as 'student' | 'instructor';
    this.selectedUsers = [];
    this.form.get('userIds')?.setValue([]);
  }

  onUsersSelected(users: UserDto[]) {
    this.selectedUsers = users;
    const ids = users.map((u) => u.id);
    this.form.get('userIds')?.setValue(ids);
  }

  get displayedUsers() {
    if (this.groupToEdit?.users?.length) {
      return this.groupToEdit.users.map((u) => ({
        id: u.id,
        label: `${u.firstName} ${u.lastName}`.trim(),
      }));
    }

    if (this.groupToEdit?.userIds?.length) {
      return this.groupToEdit.userIds.map((id) => ({
        id,
        label: String(id),
      }));
    }

    return [];
  }

  removeUserFromGroup(userId: number) {
    if (!this.groupToEdit?.id) return;

    this.notificationGroupService
      .removeUsersFromGroup(this.groupToEdit.id, [userId])
      .subscribe({
        next: () => {
          this.groupToEdit!.users = this.groupToEdit!.users?.filter(
            (u) => u.id !== userId
          );
          this.groupToEdit!.userIds = this.groupToEdit!.userIds?.filter(
            (id) => id !== userId
          );
          this.selectedUsers = this.selectedUsers.filter(
            (u) => u.id !== userId
          );
          this.form.get('userIds')?.setValue(
            this.selectedUsers.map((u) => u.id)
          );
        },
        error: (err) => {
          console.error('Error al eliminar usuario del grupo', err);
        },
      });
  }

  submitForm() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CreateNotificationGroupDto = this.form.value;
    const id = this.groupToEdit?.id;

    this.formSubmitted.emit({ payload, id });
    this.form.reset();
    this.selectedRole = null;
    this.selectedUsers = [];
    this.members = [];
  }
}