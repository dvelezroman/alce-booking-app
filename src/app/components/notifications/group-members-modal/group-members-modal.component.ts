import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationGroupDto } from '../../../services/dtos/notification.dto';

@Component({
  selector: 'app-group-members-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-members-modal.component.html',
  styleUrl: './group-members-modal.component.scss',
})
export class GroupMembersModalComponent {
  @Input() group: NotificationGroupDto | null = null;
  @Input() show: boolean = false;

  @Output() close = new EventEmitter<void>();

  onClose() {
  this.close.emit();
}
}