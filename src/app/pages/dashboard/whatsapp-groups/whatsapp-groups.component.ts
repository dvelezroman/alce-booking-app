import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GroupListComponent } from '../../../components/whatsapp/group-list/group-list.component';
import { GroupFormComponent } from '../../../components/whatsapp/group-form/group-form.component';
import { Group, WhatsAppContact, GetWhatsAppContactsResponse } from '../../../services/dtos/whatsapp-group.dto';
import { WhatsAppGroupService } from '../../../services/whatsapp-group.service';

@Component({
  selector: 'app-whatsapp-groups',
  standalone: true,
  imports: [CommonModule, GroupListComponent, GroupFormComponent],
  templateUrl: './whatsapp-groups.component.html',
  styleUrls: ['./whatsapp-groups.component.scss'],
})
export class WhatsAppGroupsComponent implements OnInit {
  showForm = false;
  contacts: WhatsAppContact[] = [];
  groups: Group[] = [];
  selectedGroup: Group | null = null;
  loading = false;
  error: string | null = null;

  constructor(private whatsappSvc: WhatsAppGroupService) {}

  ngOnInit(): void {
    this.loadGroupsAndContacts();
  }

  loadGroupsAndContacts() {
    this.loading = true;
    this.error = null;

    // Traer grupos
    this.whatsappSvc.getGroups().subscribe({
      next: (res) => {
        this.groups = res.groups || [];
      },
      error: (err) => {
        console.error('Error al cargar grupos:', err);
        this.error = 'No se pudieron cargar los grupos.';
      },
    });

    // Traer contactos
    this.whatsappSvc.getContacts().subscribe({
      next: (res: GetWhatsAppContactsResponse) => {
        this.contacts = res.contacts || [];
      },
      error: (err) => {
        console.error('Error al cargar contactos:', err);
        this.error = 'No se pudieron cargar los contactos.';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  /** Crear nuevo grupo */
  onCreateGroup() {
    if (this.showForm) return; 
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