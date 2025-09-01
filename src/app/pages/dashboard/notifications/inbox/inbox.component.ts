import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InboxFiltersComponent } from '../../../../components/notifications/inbox/inbox-filters/inbox-filters.component';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [
    CommonModule,
    InboxFiltersComponent
  ],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss'
})
export class InboxComponent {

}