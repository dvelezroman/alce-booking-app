import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GroupListComponent } from '../../../components/whatsapp/group-list/group-list.component';
import { Group, WhatsAppContact, GetWhatsAppContactsResponse } from '../../../services/dtos/whatsapp-group.dto';
import { WhatsAppGroupService } from '../../../services/whatsapp-group.service';
import { GroupDetailComponent } from '../../../components/whatsapp/group-detail/group-detail.component';

@Component({
  selector: 'app-whatsapp-groups',
  standalone: true,
  imports: [CommonModule, GroupListComponent, GroupDetailComponent],
  templateUrl: './whatsapp-groups.component.html',
  styleUrls: ['./whatsapp-groups.component.scss'],
})
export class WhatsAppGroupsComponent implements OnInit {
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

  /** Seleccionar grupo desde la lista */
  onSelectGroup(group: Group) {
    this.selectedGroup = group;
  }

  /** Cerrar modal */
  onCloseDetail() {
    this.selectedGroup = null;
  }
}