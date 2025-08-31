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
import { CreateNotificationGroupDto, NotificationGroupDto } from '../../../services/dtos/notification.dto';
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

  @Input() groupToEdit?: NotificationGroupDto;
  @Output() formSubmitted = new EventEmitter<{
    payload: CreateNotificationGroupDto;
    id?: number;
  }>();

  constructor(private fb: FormBuilder, private notificationGroupService: NotificationGroupService) {
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
    } else {
      this.form.reset();
      this.selectedUsers = [];
      this.selectedRole = null;
    }
  }

  get groupSummaryText(): string {
    if (!this.groupToEdit) return '';

    if (this.groupToEdit.users?.length) {
      return this.groupToEdit.users
        .map(u => `${u.firstName} ${u.lastName} (${u.email})`)
        .join(', ');
    }

    return this.groupToEdit.userIds?.join(', ') ?? '';
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
        label: `${u.firstName} ${u.lastName}`.trim()
      }));
    }

    if (this.groupToEdit?.userIds?.length) {
      return this.groupToEdit.userIds.map((id) => ({
        id,
        label: String(id)
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

          this.groupToEdit!.users = this.groupToEdit!.users?.filter(u => u.id !== userId);
          this.groupToEdit!.userIds = this.groupToEdit!.userIds?.filter(id => id !== userId);
          this.selectedUsers = this.selectedUsers.filter(u => u.id !== userId);
          this.form.get('userIds')?.setValue(this.selectedUsers.map(u => u.id));
        },
        error: (err) => {
          console.error('Error al eliminar usuario del grupo', err);
        }
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
  }
}