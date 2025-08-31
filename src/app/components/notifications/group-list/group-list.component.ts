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

  onEditClick(group: NotificationGroupDto) {
    this.editGroup.emit(group);
  }
}