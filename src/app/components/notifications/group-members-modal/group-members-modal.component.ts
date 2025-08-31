import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationGroupDto } from '../../../services/dtos/notification.dto';
import { NotificationGroupService } from '../../../services/notification-group.service';
import { UserDto } from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-group-members-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-members-modal.component.html',
  styleUrl: './group-members-modal.component.scss',
})
export class GroupMembersModalComponent {
  @Input() group: NotificationGroupDto | null = null;
  @Input() members: UserDto[] = [];
  @Input() show: boolean = false;

  @Output() close = new EventEmitter<void>();

  private notificationGroupService = inject(NotificationGroupService);

  onClose() {
    this.close.emit();
  }

  removeUserFromGroup(userId: number) {
    if (!this.group?.id) return;

    this.notificationGroupService
      .removeUsersFromGroup(this.group.id, [userId])
      .subscribe({
        next: () => {
          this.members = this.members.filter((u) => u.id !== userId);
          this.group!.userIds = this.group!.userIds?.filter((id) => id !== userId);
        },
        error: (err) => {
          console.error('Error al eliminar usuario del grupo', err);
        }
      });
  }
}