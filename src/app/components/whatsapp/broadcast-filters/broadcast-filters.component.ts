import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-broadcast-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './broadcast-filters.component.html',
  styleUrls: ['./broadcast-filters.component.scss'],
})
export class BroadcastFiltersComponent {
sendType: 'broadcast' | 'groups' = 'broadcast';
}