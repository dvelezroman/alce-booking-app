import { Component, Input, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserSelectorComponent } from '../user-selector/user-selector.component';
import { StageSelectorComponent } from '../stage-selector/stage-selector.component';
import { GroupListComponent } from '../group-list/group-list.component';
import { Stage } from '../../../services/dtos/student.dto';
import { UserDto } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';

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

  title = '';
  message = '';
  selectedUserRole: 'student' | 'instructor' = 'student';
  selectedStageId: number | null = null;
  selectedUsers: UserDto[] = [];
  users: UserDto[] = [];
  totalUsersInStage: number = 0;

  constructor(private usersService: UsersService) {}

  handleUsersSelected(users: UserDto[]) {
    this.selectedUsers = users;
  }

  handleStageChange(stageId: number | null) {
    this.selectedStageId = stageId;

    if (stageId) {
      this.fetchUsersByStage(stageId);
    } else {
      this.users = [];
    }
  }

  fetchUsersByStage(stageId: number) {
    this.usersService
      .searchUsers(
        undefined,
        undefined,
        undefined,
        '',
        '',
        undefined,
        'STUDENT',
        true,
        stageId
      )
      .subscribe({
        next: (res) => {
          this.users = res.users;
          this.totalUsersInStage = res.total || res.users.length;
        },
        error: () => {
          this.users = [];
          this.totalUsersInStage = 0;
        },
      });
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