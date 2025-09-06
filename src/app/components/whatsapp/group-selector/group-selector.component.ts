import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsAppGroup } from '../../../services/dtos/whatsapp-group.dto';
import { DiffusionGroup } from '../../../services/dtos/whatsapp-diffusion-group.dto';

type Mode = 'broadcast' | 'groups';

interface UiItem {
  id: string;
  title: string;
  sub: string;
}

@Component({
  selector: 'app-group-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-selector.component.html',
  styleUrls: ['./group-selector.component.scss'],
})
export class GroupSelectorComponent implements OnChanges {
  /** ======= Inputs desde el padre ======= */
  @Input() mode: Mode = 'broadcast';
  @Input() query: string | null = null;
  @Input() selectedGroupId: string | number | null = null;
  @Input() groups: WhatsAppGroup[] = [];
  @Input() diffusionGroups: DiffusionGroup[] = [];
  @Input() loading = false;

  /** ======= Output hacia el padre ======= */
  @Output() selectionChange = new EventEmitter<string[]>();

  /** ======= Estado interno (UI) ======= */
  available: UiItem[] = [];         // lista visible en “Disponibles”
  selectedIds: string[] = [];       // ids seleccionados

  ngOnChanges(_: SimpleChanges): void {
    this.buildAvailable();
  }

  /** Construye lista visible respetando mode, query y stageId */
  private buildAvailable(): void {
    const q = (this.query || '').toLowerCase().trim();
    if (this.mode === 'broadcast') {
      let list = this.diffusionGroups || [];
      if (this.selectedGroupId) list = list.filter(g => g.id === String(this.selectedGroupId)); // ajusta si tu criterio real difiere
      if (q) {
        list = list.filter(g =>
          (g.name || '').toLowerCase().includes(q) ||
          (g.description || '').toLowerCase().includes(q)
        );
      }
      this.available = list.map(g => ({
        id: g.id,
        title: `Difusión · ${g.name}`,
        sub: `${g.participantsCount} contactos`,
      }));
    } else {
      let list = this.groups || [];
      if (this.selectedGroupId) list = list.filter(g => g.id === String(this.selectedGroupId));
      if (q) {
        list = list.filter(g =>
          (g.name || '').toLowerCase().includes(q) ||
          (g.description || '').toLowerCase().includes(q)
        );
      }
      this.available = list.map(g => ({
        id: g.id,
        title: `Grupo · ${g.name}`,
        sub: `${g.participantsCount} miembros`,
      }));
    }
  }

  /** Marca / desmarca un ítem */
  toggle(id: string, checked: boolean) {
    const set = new Set(this.selectedIds);
    if (checked) set.add(id);
    else set.delete(id);
    this.selectedIds = Array.from(set);
    this.selectionChange.emit(this.selectedIds);
  }

  getGroupTitle(id: string): string {
    return this.available.find(v => v.id === id)?.title || id;
  }

  getGroupSub(id: string): string {
    return this.available.find(v => v.id === id)?.sub || '';
  }
}