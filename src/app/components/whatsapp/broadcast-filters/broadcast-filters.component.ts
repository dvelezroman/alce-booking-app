import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsAppGroup } from '../../../services/dtos/whatsapp-group.dto';
import { DiffusionGroup } from '../../../services/dtos/whatsapp-diffusion-group.dto';

type Mode = 'broadcast' | 'groups';

@Component({
  selector: 'app-broadcast-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './broadcast-filters.component.html',
  styleUrls: ['./broadcast-filters.component.scss'],
})
export class BroadcastFiltersComponent {
  @Input() mode: Mode = 'broadcast';
  @Input() selectedGroupId: string | null = null;
  @Input() query: string | null = null;
  @Input() groups: WhatsAppGroup[] = [];
  @Input() diffusionGroups: DiffusionGroup[] = [];

  @Output() modeChange = new EventEmitter<Mode>();
  @Output() filterChange = new EventEmitter<{ stageId?: string | null; query?: string | null }>();

  get options(): { id: string; label: string }[] {
    if (this.mode === 'broadcast') {
      return (this.diffusionGroups || []).map(g => ({
        id: g.id,
        label: `Difusión · ${g.name}`,
      }));
    }
    return (this.groups || []).map(g => ({
      id: g.id,
      label: `Grupo · ${g.name}`,
    }));
  }

  onToggleMode(selected: Mode) {
    if (this.mode !== selected) {
      this.mode = selected;
      this.modeChange.emit(this.mode);
      this.onStageChange('');
    }
  }

  onStageChange(value: string) {
    this.selectedGroupId = value.trim() === '' ? null : value;
    this.filterChange.emit({ stageId: this.selectedGroupId });
  }

  onQueryChange(value: string) {
    this.query = value || null;
    this.filterChange.emit({ query: this.query });
  }
}