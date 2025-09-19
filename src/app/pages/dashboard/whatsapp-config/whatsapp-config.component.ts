import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Group, WhatsAppContact, WhatsAppStatus } from '../../../services/dtos/whatsapp-group.dto';
import { DiffusionGroup } from '../../../services/dtos/whatsapp-diffusion-group.dto';
import { WhatsAppGroupService } from '../../../services/whatsapp-group.service';

@Component({
  selector: 'app-whatsapp-config',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-config.component.html',
  styleUrl: './whatsapp-config.component.scss',
})
export class WhatsappConfigComponent {
  loadingGroups = false;
  loadingDiffusions = false;
  loadingContacts = false;

  groups: Group[] = [];
  diffusionGroups: DiffusionGroup[] = [];
  contacts: WhatsAppContact[] = [];

  errorGroups: string | null = null;
  errorDiffusions: string | null = null; 
  errorContacts: string | null = null;

  status: WhatsAppStatus | null = null;
  loadingStatus = false;
  errorStatus: string | null = null;

  constructor(private whatsappService: WhatsAppGroupService) {}

  ngOnInit(): void {
   this.loadStatus();
  }

  loadStatus(): void {
    this.loadingStatus = true;
    this.errorStatus = null;

    this.whatsappService.getStatus().subscribe({
      next: (res) => {
        this.status = res;
        this.loadingStatus = false;
      },
      error: (err) => {
        this.errorStatus = 'No se pudo obtener el estado de WhatsApp.';
        this.loadingStatus = false;
      }
    });
  }

  syncContacts(): void {
    this.loadingContacts = true;
    this.whatsappService.getContactsFromDatabase().subscribe({
      next: (res) => {
        this.contacts = res.contacts;
        this.loadingContacts = false;
      },
      error: () => {
        this.errorContacts = 'Error al sincronizar contactos';
        this.loadingContacts = false;
      }
    });
  }

  syncGroups(): void {
    this.loadingGroups = true;
    this.whatsappService.getGroups().subscribe({
      next: (res) => {
        this.groups = res.groups;
        //console.log('Grupos sincronizados:', this.groups);
      },
      error: (err) => {
        this.errorGroups = 'Error al cargar grupos';
        this.loadingGroups = false;
      },
      complete: () => {
        this.loadingGroups = false;
      },
    });
  }

  syncDiffusions(): void {
    this.loadingDiffusions = true;
    this.whatsappService.getDiffusionGroups().subscribe({
      next: (res) => {
        this.diffusionGroups = res.groups;
        //console.log('Difusiones sincronizadas:', this.diffusionGroups);
      },
      error: (err) => {
        this.errorDiffusions = 'Error al cargar difusiones';
        this.loadingDiffusions = false;
      },
      complete: () => {
        this.loadingDiffusions = false;
      },
    });
  }
}