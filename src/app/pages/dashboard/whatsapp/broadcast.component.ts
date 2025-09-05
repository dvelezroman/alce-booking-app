import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BroadcastFiltersComponent } from '../../../components/whatsapp/broadcast-filters/broadcast-filters.component';
import { GroupSelectorComponent } from '../../../components/whatsapp/group-selector/group-selector.component';
import { MessageComposerComponent } from '../../../components/whatsapp/message-composer/message-composer.component';
import { ScheduleBarComponent } from '../../../components/whatsapp/schedule-bar/schedule-bar.component';

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
export class BroadcastComponent {}