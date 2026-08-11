import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type PlatformAssessmentTab =
  | 'pending'
  | 'expired'
  | 'completed';

@Component({
  selector: 'app-platform-assessment-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl:
    './platform-assessment-summary.component.html',
  styleUrl:
    './platform-assessment-summary.component.scss',
})
export class PlatformAssessmentSummaryComponent {
  @Input() activeCount = 0;
  @Input() expiredCount = 0;
  @Input() completedCount = 0;

  @Input()
  selectedTab: PlatformAssessmentTab =
    'pending';

  @Output()
  selectTab =
    new EventEmitter<PlatformAssessmentTab>();

  onSelect(
    tab: PlatformAssessmentTab
  ): void {
    this.selectTab.emit(tab);
  }

  get isPendingSelected(): boolean {
    return this.selectedTab === 'pending';
  }

  get isExpiredSelected(): boolean {
    return this.selectedTab === 'expired';
  }

  get isCompletedSelected(): boolean {
    return this.selectedTab === 'completed';
  }
}