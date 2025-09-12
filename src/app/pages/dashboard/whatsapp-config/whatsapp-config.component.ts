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

  constructor(private whatsappService: WhatsAppGroupService) {}

  syncGroups(): void {
    this.loadingGroups = true;
    this.whatsappService.getGroups().subscribe({
      next: (res) => {
        this.groups = res.groups;
        console.log('Grupos sincronizados:', this.groups);
      },
      error: (err) => {
        console.error('Error al sincronizar grupos:', err);
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
        console.log('Difusiones sincronizadas:', this.diffusionGroups);
      },
      error: (err) => {
        console.error('Error al sincronizar difusiones:', err);
        this.loadingDiffusions = false;
      },
      complete: () => {
        this.loadingDiffusions = false;
      },
    });
  }
}