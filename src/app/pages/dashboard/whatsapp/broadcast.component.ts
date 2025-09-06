import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BroadcastFiltersComponent } from '../../../components/whatsapp/broadcast-filters/broadcast-filters.component';
import { GroupSelectorComponent } from '../../../components/whatsapp/group-selector/group-selector.component';
import { MessageComposerComponent } from '../../../components/whatsapp/message-composer/message-composer.component';
import { ScheduleBarComponent } from '../../../components/whatsapp/schedule-bar/schedule-bar.component';

import { WhatsAppGroupService } from '../../../services/whatsapp-group.service';
import { WhatsAppGroup } from '../../../services/dtos/whatsapp-group.dto';
import { DiffusionGroup } from '../../../services/dtos/whatsapp-diffusion-group.dto';
import { forkJoin } from 'rxjs';

type Mode = 'broadcast' | 'groups';

export interface BroadcastFilterState {
  mode: Mode;
  query: string | null;
  selectedGroupId: string | null;
}

@Component({
  selector: 'app-broadcast',
  standalone: true,
  imports: [
    CommonModule,
    BroadcastFiltersComponent,
    GroupSelectorComponent,
    MessageComposerComponent,
    ScheduleBarComponent,
  ],
  templateUrl: './broadcast.component.html',
  styleUrls: ['./broadcast.component.scss'],
})
export class BroadcastComponent implements OnInit {
  loading = false;
  error: string | null = null;

  groups: WhatsAppGroup[] = [];
  diffusionGroups: DiffusionGroup[] = [];

  filters: BroadcastFilterState = {
    mode: 'broadcast',
    query: null,
    selectedGroupId: null,
  };

  selectedGroupIds: string[] = [];

  constructor(private whatsappSvc: WhatsAppGroupService) {}

  ngOnInit(): void {
   // this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      groupsRes: this.whatsappSvc.getGroups(),
      diffusionRes: this.whatsappSvc.getDiffusionGroups(),
    }).subscribe({
      next: ({ groupsRes, diffusionRes }) => {
        this.groups = groupsRes.groups ?? [];
        this.diffusionGroups = diffusionRes.diffusionGroups ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('[Broadcast] loadData error', err);
        this.error = 'No se pudieron cargar los grupos.';
        this.loading = false;
      },
    });
  }

  onModeChange(mode: Mode) {
    this.filters = {
      ...this.filters,
      mode,
      selectedGroupId: null,
    };
  }

  onFilterChange(patch: Partial<BroadcastFilterState>) {
    this.filters = { ...this.filters, ...patch };
  }

  onSelectionChange(ids: string[]) {
    this.selectedGroupIds = ids;
  }
}