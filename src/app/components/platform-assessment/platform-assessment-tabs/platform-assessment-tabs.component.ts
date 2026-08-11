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
  selector: 'app-platform-assessment-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl:
    './platform-assessment-tabs.component.html',
  styleUrl:
    './platform-assessment-tabs.component.scss',
})
export class PlatformAssessmentTabsComponent {
  @Input()
  selectedTab: PlatformAssessmentTab =
    'pending';

  @Input()
  activeCount = 0;

  @Input()
  expiredCount = 0;

  @Input()
  completedCount = 0;

  @Output()
  tabChange =
    new EventEmitter<PlatformAssessmentTab>();

  onTabChange(
    tab: PlatformAssessmentTab
  ): void {
    if (this.selectedTab === tab) {
      return;
    }

    this.tabChange.emit(tab);
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