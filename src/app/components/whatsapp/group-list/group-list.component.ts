import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Group } from '../../../services/dtos/whatsapp-group.dto';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss'],
})
export class GroupListComponent {
  @Input() groups: Group[] = [ ];

  @Output() editGroup = new EventEmitter<Group>();

  onEdit(group: Group) {
    this.editGroup.emit(group);
  }
}