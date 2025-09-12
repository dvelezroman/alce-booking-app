import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GroupListComponent } from '../../../components/whatsapp/group-list/group-list.component';
import { GroupFormComponent } from '../../../components/whatsapp/group-form/group-form.component';
import { Contact, Group } from '../../../services/dtos/whatsapp-group.dto';

@Component({
  selector: 'app-whatsapp-groups',
  standalone: true,
  imports: [CommonModule, GroupListComponent, GroupFormComponent],
  templateUrl: './whatsapp-groups.component.html',
  styleUrls: ['./whatsapp-groups.component.scss'],
})
export class WhatsAppGroupsComponent implements OnInit {
  showForm = false;
  contacts: Contact[] = [];
  groups: Group[] = [];
  selectedGroup: Group | null = null;

  ngOnInit(): void {
    this.fetchContacts();
    this.fetchGroups();
  }

  /** Simulación fetch contactos */
  fetchContacts() {
    this.contacts = [
      { id: '1', name: 'Juan Pérez', phone: '+593987654321' },
      { id: '2', name: 'María López', phone: '+593912345678' },
      { id: '3', name: 'Carlos Torres', phone: '+593998877665' },
    ];
  }

  /** Simulación fetch grupos */
  fetchGroups() {
    this.groups = [
      // { id: '1', name: 'Inspectores', description: 'Grupo 1', members: ['1', '2'] },
      // { id: '2', name: 'Estudiantes', description: 'Grupo 2', members: ['2', '3'] },
      // { id: '3', name: 'Stages', description: 'Grupo 3', members: ['1', '3'] },
    ];
  }

  /** Crear nuevo grupo */
  onCreateGroup() {
    this.selectedGroup = null;
    this.showForm = true;
  }

  /** Editar grupo desde la lista */
  onEditGroup(group: Group) {
    this.selectedGroup = group;
    this.showForm = true;
  }

  /** Cerrar formulario */
  onCloseForm() {
    this.showForm = false;
    this.selectedGroup = null;
  }
}