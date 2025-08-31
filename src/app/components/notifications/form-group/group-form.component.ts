import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserSelectorComponent } from '../user-selector/user-selector.component'; 
import { UserDto } from '../../../services/dtos/user.dto';
import { NotificationGroupService } from '../../../services/notification-group.service';
import { CreateNotificationGroupDto } from '../../../services/dtos/notification.dto';

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserSelectorComponent],
  templateUrl: './group-form.component.html',
  styleUrl: './group-form.component.scss'
})
export class GroupFormComponent {
  form: FormGroup;
  selectedRole: 'student' | 'instructor' | null = null;
  selectedUsers: UserDto[] = [];

  @Output() groupCreated = new EventEmitter<void>();

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

  submitForm() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CreateNotificationGroupDto = this.form.value;
    this.notificationGroupService.createGroup(payload).subscribe({
      next: () => {
        console.log('Grupo creado exitosamente');
        this.groupCreated.emit();
        this.form.reset();
        this.selectedRole = null;
        this.selectedUsers = [];
      },
      error: (err) => {
        console.error('Error al crear grupo:', err);
      },
    });
  }
}