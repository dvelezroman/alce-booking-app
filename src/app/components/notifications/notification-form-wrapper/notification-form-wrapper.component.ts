import { Component, Input, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserSelectorComponent } from '../user-selector/user-selector.component';
import { StageSelectorComponent } from '../stage-selector/stage-selector.component';
import { GroupListComponent } from '../group-list/group-list.component';
import { Stage } from '../../../services/dtos/student.dto';
import { UserDto } from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-notification-form-wrapper',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserSelectorComponent,
    StageSelectorComponent,
    GroupListComponent,
  ],
  templateUrl: './notification-form-wrapper.component.html',
  styleUrl: './notification-form-wrapper.component.scss',
})
export class NotificationFormWrapperComponent {
  @Input() selectedType: 'user' | 'stage' | 'group' = 'user';
  @Input() stages: Stage[] = [];

  @ViewChild('formRef') formRef!: NgForm;

  // Estado del formulario
  title = '';
  message = '';
  selectedUserRole: 'student' | 'instructor' = 'student';
  selectedStageId?: number;
  selectedUsers: UserDto[] = [];

  handleUsersSelected(users: UserDto[]) {
    this.selectedUsers = users;
  }

  submitForm() {
    if (!this.formRef.valid) return;

    const payload: any = {
      type: this.selectedType,
      title: this.title,
      message: this.message,
    };

    if (this.selectedType === 'user') {
      payload.userIds = this.selectedUsers.map((u) => u.id);
      payload.userRole = this.selectedUserRole;
      if (this.selectedUserRole === 'student') {
        payload.stageId = this.selectedStageId;
      }
    }

    console.log('Enviando notificación:', payload);
  }
}