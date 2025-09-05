import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
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

  openMenuId: number | null = null;

  onEditClick(group: NotificationGroupDto) {
    this.openMenuId = null; 
    this.editGroup.emit(group);
    this.openMenuId = null;
  }

  onCardClick(group: NotificationGroupDto) {
    this.openMenuId = null;
    this.viewGroupMembers.emit(group);
  }

  onDeleteClick(group: NotificationGroupDto, ev?: MouseEvent) {
    ev?.stopPropagation();
    this.deleteGroup.emit(group);
    this.openMenuId = null;
  }

  toggleMenu(group: NotificationGroupDto, ev: MouseEvent) {
    ev.stopPropagation();
    this.openMenuId = this.openMenuId === group.id ? null : group.id;
  }

  @HostListener('document:click')
  closeAllMenus() {
    this.openMenuId = null;
  }
}