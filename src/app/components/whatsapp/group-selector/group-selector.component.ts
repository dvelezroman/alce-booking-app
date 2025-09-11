import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsAppGroup } from '../../../services/dtos/whatsapp-group.dto';
import { DiffusionGroup } from '../../../services/dtos/whatsapp-diffusion-group.dto';
import { SelectionType } from '../broadcast-filters/broadcast-filters.component';

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
  @Input() type: SelectionType = null; // ahora usamos el mismo tipo del filtro padre
  @Input() query: string | null = null;
  @Input() selectedGroupId: string | number | null = null;
  @Input() groups: WhatsAppGroup[] = [];
  @Input() diffusionGroups: DiffusionGroup[] = [];
  @Input() contacts: { id: string; name: string; phone?: string }[] = [];
  @Input() loading = false;

  /** ======= Output hacia el padre ======= */
  @Output() selectionChange = new EventEmitter<string[]>();

  /** ======= Estado interno (UI) ======= */
  available: UiItem[] = [];
  selectedIds: string[] = [];

  ngOnChanges(_: SimpleChanges): void {
    this.buildAvailable();
  }

  /** Construye lista visible según el tipo elegido */
  private buildAvailable(): void {
    const q = (this.query || '').toLowerCase().trim();

    if (this.type === 'diffusion') {
      let list = this.diffusionGroups || [];
      if (this.selectedGroupId) {
        list = list.filter((g) => g.id === String(this.selectedGroupId));
      }
      if (q) {
        list = list.filter(
          (g) =>
            (g.name || '').toLowerCase().includes(q) ||
            (g.description || '').toLowerCase().includes(q)
        );
      }
      this.available = list.map((g) => ({
        id: g.id,
        title: `Difusión · ${g.name}`,
        sub: `${g.participantsCount} contactos`,
      }));
    } else if (this.type === 'group') {
      let list = this.groups || [];
      if (this.selectedGroupId) {
        list = list.filter((g) => g.id === String(this.selectedGroupId));
      }
      if (q) {
        list = list.filter(
          (g) =>
            (g.name || '').toLowerCase().includes(q) ||
            (g.description || '').toLowerCase().includes(q)
        );
      }
      this.available = list.map((g) => ({
        id: g.id,
        title: `Grupo · ${g.name}`,
        sub: `${g.participantsCount} miembros`,
      }));
    } else if (this.type === 'contact') {
      let list = this.contacts || [];
      if (q) {
        list = list.filter(
          (c) =>
            (c.name || '').toLowerCase().includes(q) ||
            (c.phone || '').toLowerCase().includes(q)
        );
      }
      this.available = list.map((c) => ({
        id: c.id,
        title: c.name,
        sub: c.phone ? `Tel: ${c.phone}` : 'Contacto',
      }));
    } else {
      this.available = [];
    }

    // limpiar seleccionados inválidos
    this.selectedIds = this.selectedIds.filter((id) =>
      this.available.some((a) => a.id === id)
    );
    this.selectionChange.emit(this.selectedIds);
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
    return this.available.find((v) => v.id === id)?.title || id;
  }

  getGroupSub(id: string): string {
    return this.available.find((v) => v.id === id)?.sub || '';
  }
}