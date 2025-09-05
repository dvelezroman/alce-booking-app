import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BroadcastFiltersComponent } from '../../../components/whatsapp/broadcast-filters/broadcast-filters.component';
import { GroupSelectorComponent } from '../../../components/whatsapp/group-selector/group-selector.component';
import { MessageComposerComponent } from '../../../components/whatsapp/message-composer/message-composer.component';
import { ScheduleBarComponent } from '../../../components/whatsapp/schedule-bar/schedule-bar.component';
import { SummaryFooterComponent } from '../../../components/whatsapp/summary-footer/summary-footer.component';

@Component({
  selector: 'app-broadcast',
  standalone: true,
  imports: [
    CommonModule,
    BroadcastFiltersComponent,
    GroupSelectorComponent,
    MessageComposerComponent,
    ScheduleBarComponent,
    SummaryFooterComponent,
  ],
  templateUrl: './broadcast.component.html',
  styleUrls: ['./broadcast.component.scss'],
})
export class BroadcastComponent {}