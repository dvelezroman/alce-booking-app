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
  @Input() groups: Group[] = [
    { id: '1', name: 'Familia', description: 'Grupo familiar 💙', members: ['1', '2'] },
    { id: '2', name: 'Amigos', description: 'El combo de siempre 🎉', members: ['2', '3'] },
    { id: '3', name: 'Trabajo', description: 'Equipo de proyecto 🚀', members: ['1', '3'] },
  ];

  @Output() editGroup = new EventEmitter<Group>();

  onEdit(group: Group) {
    this.editGroup.emit(group);
  }
}