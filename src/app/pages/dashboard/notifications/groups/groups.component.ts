import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupFormComponent } from '../../../../components/notifications/form-group/group-form.component';
import { GroupListComponent } from '../../../../components/notifications/group-list/group-list.component';
import { NotificationGroupService } from '../../../../services/notification-group.service';
import { NotificationGroupDto } from '../../../../services/dtos/notification.dto';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GroupFormComponent,
    GroupListComponent,
  ],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
})
export class GroupsComponent implements OnInit {
  showModal = false;
  groups: NotificationGroupDto[] = [];
  loading = false;
  groupToEdit?: NotificationGroupDto;

  constructor(private notificationService: NotificationGroupService) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  openCreateGroup() {
    this.groupToEdit = undefined;
    this.showModal = true;
  }

  openEditGroup(group: NotificationGroupDto) {
    this.groupToEdit = group;
    this.showModal = true;
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

  onGroupCreated() {
    this.closeModal();
    this.loadGroups();
  }

  onGroupUpdated() {
    this.closeModal();
    this.loadGroups();
  }
}