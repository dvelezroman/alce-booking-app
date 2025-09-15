import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BroadcastFiltersComponent, SelectionType } from '../../../components/whatsapp/broadcast-filters/broadcast-filters.component';
import { GroupSelectorComponent } from '../../../components/whatsapp/group-selector/group-selector.component';
import { MessageComposerComponent } from '../../../components/whatsapp/message-composer/message-composer.component';
import { WhatsAppGroupService } from '../../../services/whatsapp-group.service';
import { DiffusionGroup } from '../../../services/dtos/whatsapp-diffusion-group.dto';
import { Group } from '../../../services/dtos/whatsapp-group.dto';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { ModalComponent } from '../../../components/modal/modal.component';

export interface BroadcastFilterState {
  query: string | null;
  selectedGroupId: string | null;
  type: SelectionType; 
}

@Component({
  selector: 'app-broadcast',
  standalone: true,
  imports: [
    CommonModule,
    BroadcastFiltersComponent,
    GroupSelectorComponent,
    MessageComposerComponent,
    ModalComponent,
  ],
  templateUrl: './broadcast.component.html',
  styleUrls: ['./broadcast.component.scss'],
})
export class BroadcastComponent implements OnInit {
  loading = false;
  error: string | null = null;

  groups: Group[] = [];
  diffusionGroups: DiffusionGroup[] = [];
  contacts: { id: string; name: string; phone?: string }[] = [];
  message: string = '';

  filters: BroadcastFilterState = {
    query: null,
    selectedGroupId: null,
    type: null,
  };

  selectedGroupIds: string[] = [];
  modal: ModalDto = modalInitializer();
  private modalTimer: number | undefined;

  constructor(private whatsappSvc: WhatsAppGroupService) {}

  ngOnInit(): void {

  }

  onTypeChange(type: SelectionType) {
    this.filters = { ...this.filters, type };
    console.log('[Broadcast padre] tipo seleccionado:', type);

    this.loading = true;
    this.error = null;

    switch (type) {
      case 'group':
        this.whatsappSvc.getGroups().subscribe({
          next: (res) => {
            this.groups = res.groups || [];
            this.loading = false;
          },
          error: (err) => {
            console.error('Error al obtener grupos:', err);
            this.error = 'No se pudieron cargar los grupos';
            this.loading = false;
          }
        });
        break;

      case 'diffusion':
        this.whatsappSvc.getDiffusionGroups().subscribe({
          next: (res) => {
            this.diffusionGroups = res.groups || [];
            this.loading = false;
          },
          error: (err) => {
            console.error('Error al obtener difusiones:', err);
            this.error = 'No se pudieron cargar los grupos de difusiones';
            this.loading = false;
          }
        });
        break;

      case 'contact':
        this.whatsappSvc.getContacts().subscribe({
          next: (res) => {
            this.contacts = res.contacts || [];
            this.loading = false;
          },
          error: (err) => {
            console.error('Error al obtener contactos:', err);
            this.error = 'No se pudieron cargar los contactos';
            this.loading = false;
          }
        });
        break;
    }
  }

  onSelectionChange(ids: string[]) {
    this.selectedGroupIds = ids;
  }

  onMessageChange(msg: string) {
    this.message = msg;
  }

  onSend() {
    if (!this.filters.type || !this.message.trim()) {
      this.showErrorModal('Debes seleccionar un destino y escribir un mensaje.');
      return;
    }

    switch (this.filters.type) {
      case 'contact':
        this.sendToContacts();
        break;
      case 'group':
        this.sendToGroups();
        break;
      case 'diffusion':
        this.sendToDiffusions();
        break;
    }
  }

  /** ===== Enviar a contactos ===== */
  private sendToContacts() {
    if (!this.selectedGroupIds.length) {
      this.showErrorModal('Debes seleccionar al menos un contacto.');
      return;
    }

    this.selectedGroupIds.forEach((id) => {
      const contact = this.contacts.find((c) => c.id === id);
      if (contact?.phone) {
        this.whatsappSvc.sendMessageToContact({
          phone: contact.phone,
          message: this.message,
        }).subscribe({
          next: (res) => {
            //console.log('Mensaje enviado a contacto:', res);
            this.showSuccessModal(`Mensaje enviado a ${contact.name || contact.phone}`);
          },
          error: (err) => {
            console.error(err);
            this.showErrorModal(`Error al enviar mensaje a ${contact?.name || 'contacto'}`);
          }
        });
      }
    });
  }

  /** ===== Enviar a grupos ===== */
  private sendToGroups() {
    if (!this.selectedGroupIds.length) {
      this.showErrorModal('Debes seleccionar al menos un grupo.');
      return;
    }

    this.selectedGroupIds.forEach((id) => {
      const group = this.groups.find((g) => g.id === id);
      if (group) {
        this.whatsappSvc.sendMessageToGroup({
          groupName: group.name,
          message: this.message,
          searchById: false,
        }).subscribe({
          next: (res) => {
            //console.log('Mensaje enviado a grupo:', res);
            this.showSuccessModal(`Mensaje enviado al grupo ${group.name}`);
          },
          error: (err) => {
            console.error(err);
            this.showErrorModal(`Error al enviar mensaje al grupo ${group?.name}`);
          }
        });
      }
    });
  }

  /** ===== Enviar a difusiones ===== */
  private sendToDiffusions() {
    if (!this.selectedGroupIds.length) {
      this.showErrorModal('Debes seleccionar al menos una lista de difusión.');
      return;
    }

    this.selectedGroupIds.forEach((id) => {
      const diffusion = this.diffusionGroups.find((d) => d.id === id);
      if (diffusion) {
        this.whatsappSvc.sendMessageToDiffusion({
          groupName: diffusion.name,
          message: this.message,
          searchById: false,
        }).subscribe({
          next: (res) => {
            //console.log('Mensaje enviado a difusión:', res);
            this.showSuccessModal(`Mensaje enviado a la difusión ${diffusion.name}`);
          },
          error: (err) => {
            console.error(err);
            this.showErrorModal(`Error al enviar mensaje a la difusión ${diffusion?.name}`);
          }
        });
      }
    });
  }

  private showSuccessModal(msg: string) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: msg,
      isSuccess: true,
      close: () => (this.modal.show = false),
    };
    this.autoHideModal();
  }

  private showErrorModal(msg: string) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: msg,
      isError: true,
      close: () => (this.modal.show = false),
    };
    this.autoHideModal();
  }

  private autoHideModal(ms = 2000) {
    if (this.modalTimer) {
      clearTimeout(this.modalTimer);
    }
    this.modalTimer = window.setTimeout(() => {
      this.modal.show = false;
    }, ms);
  }
}