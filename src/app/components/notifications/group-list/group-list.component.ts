import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationGroupDto } from '../../../services/dtos/notification.dto';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.scss',
})
export class GroupListComponent {
  @Input() groups: NotificationGroupDto[] = [];

  @Output() editGroup = new EventEmitter<NotificationGroupDto>();
  @Output() viewGroupMembers = new EventEmitter<NotificationGroupDto>();
  @Output() deleteGroup = new EventEmitter<NotificationGroupDto>();

  onEditClick(group: NotificationGroupDto) {
    this.editGroup.emit(group);
  }

  onCardClick(group: NotificationGroupDto) {
    this.viewGroupMembers.emit(group);
  }

  onDeleteClick(group: NotificationGroupDto, ev: MouseEvent) {
    ev.stopPropagation();
    this.deleteGroup.emit(group);
  }
}