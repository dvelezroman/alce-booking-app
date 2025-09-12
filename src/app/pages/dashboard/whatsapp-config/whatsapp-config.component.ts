import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Group } from '../../../services/dtos/whatsapp-group.dto';
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

  groups: Group[] = [];
  diffusionGroups: DiffusionGroup[] = [];

  errorGroups: string | null = null;
  errorDiffusions: string | null = null;  

  constructor(private whatsappService: WhatsAppGroupService) {}

  syncGroups(): void {
    this.loadingGroups = true;
    this.whatsappService.getGroups().subscribe({
      next: (res) => {
        this.groups = res.groups;
        //console.log('Grupos sincronizados:', this.groups);
      },
      error: (err) => {
        this.errorGroups = 'Error al cargar grupos: ' + (err.message || err.statusText);
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
        this.errorDiffusions = 'Error al cargar difusiones: ' + (err.message || err.statusText);
        this.loadingDiffusions = false;
      },
      complete: () => {
        this.loadingDiffusions = false;
      },
    });
  }
}