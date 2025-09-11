import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BroadcastFiltersComponent, SelectionType } from '../../../components/whatsapp/broadcast-filters/broadcast-filters.component';
import { GroupSelectorComponent } from '../../../components/whatsapp/group-selector/group-selector.component';
import { MessageComposerComponent } from '../../../components/whatsapp/message-composer/message-composer.component';
import { ScheduleBarComponent } from '../../../components/whatsapp/schedule-bar/schedule-bar.component';

import { WhatsAppGroupService } from '../../../services/whatsapp-group.service';
import { WhatsAppGroup } from '../../../services/dtos/whatsapp-group.dto';
import { DiffusionGroup } from '../../../services/dtos/whatsapp-diffusion-group.dto';
import { forkJoin } from 'rxjs';

type Mode = 'broadcast' | 'groups';

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
  contacts: { id: string; name: string; phone?: string }[] = [];
  message: string = '';

  filters: BroadcastFilterState = {
    query: null,
    selectedGroupId: null,
    type: null,
  };

  selectedGroupIds: string[] = [];

  constructor(private whatsappSvc: WhatsAppGroupService) {}

  ngOnInit(): void {

  }

  onTypeChange(type: SelectionType) {
  this.filters = { ...this.filters, type };
  console.log('[Broadcast padre] tipo seleccionado:', type);

  switch (type) {
    case 'group':
      // Aquí irá this.whatsappSvc.getGroups()...
      break;
    case 'diffusion':
      // Aquí irá this.whatsappSvc.getDiffusionGroups()...
      break;
    case 'contact':
      // Aquí irá this.whatsappSvc.getContacts()...
      break;
  }
}

  onSelectionChange(ids: string[]) {
    this.selectedGroupIds = ids;
    //console.log('[Broadcast padre] grupos/ids seleccionados:', ids);
  }

  onMessageChange(msg: string) {
    this.message = msg;
  }

  onSend() {
    console.log('Payload listo para enviar:', {
      type: this.filters.type,
      recipients: this.selectedGroupIds,
      message: this.message,
    });
  }
}