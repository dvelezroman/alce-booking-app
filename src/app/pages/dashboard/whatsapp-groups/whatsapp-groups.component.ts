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

    // Traer grupos normales
    this.whatsappSvc.getGroups().subscribe({
      next: (res) => {
        const normalGroups = res.groups || [];
        // Traer grupos de difusión y unir
        this.whatsappSvc.getDiffusionGroups().subscribe({
          next: (res2) => {
            const diffusionGroups = res2.groups || [];
            this.groups = [...normalGroups, ...diffusionGroups];
          },
          error: (err) => {
            console.error('Error al cargar grupos de difusión:', err);
            this.error = 'No se pudieron cargar los grupos de difusión.';
          },
          complete: () => {
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar grupos:', err);
        this.error = 'No se pudieron cargar los grupos.';
        this.loading = false;
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
      }
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