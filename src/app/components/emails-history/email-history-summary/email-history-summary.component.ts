import {
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-history-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl:
    './email-history-summary.component.html',
  styleUrl:
    './email-history-summary.component.scss',
})
export class EmailHistorySummaryComponent {

  @Input()
  total = 0;

  @Input()
  startIndex = 0;

  @Input()
  endIndex = 0;
}