import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserSelectorComponent } from '../user-selector/user-selector.component'; 
import { UserDto } from '../../../services/dtos/user.dto';
import { NotificationGroupService } from '../../../services/notification-group.service';
import { CreateNotificationGroupDto,  NotificationGroupDto } from '../../../services/dtos/notification.dto';

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserSelectorComponent],
  templateUrl: './group-form.component.html',
  styleUrl: './group-form.component.scss'
})
export class GroupFormComponent implements OnChanges {
  form: FormGroup;
  selectedRole: 'student' | 'instructor' | null = null;
  selectedUsers: UserDto[] = [];

  @Input() groupToEdit?: NotificationGroupDto;
  @Output() groupCreated = new EventEmitter<void>();
  @Output() groupUpdated = new EventEmitter<void>();

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
    }else {
      this.form.reset();
      this.selectedUsers = [];
      this.selectedRole = null;
    }
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

    if (this.groupToEdit) {
      this.notificationGroupService.updateGroup(this.groupToEdit.id, payload).subscribe({
        next: () => {
          console.log('Grupo actualizado exitosamente');
          this.groupUpdated.emit();
        },
        error: (err) => {
          console.error('Error al actualizar grupo:', err);
        },
      });
    } else {
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
}