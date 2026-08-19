import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export type AssessmentReportTab =
  | 'instructor'
  | 'platform';

@Component({
  selector: 'app-assessment-reports-tabs',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './assessment-reports-tabs.component.html',
  styleUrl: './assessment-reports-tabs.component.scss',
})
export class AssessmentReportsTabsComponent {

  @Input() activeTab: AssessmentReportTab =
    'instructor';

  @Output() tabChange =
    new EventEmitter<AssessmentReportTab>();

  selectTab(
    tab: AssessmentReportTab,
  ): void {
    if (
      tab === this.activeTab
    ) {
      return;
    }

    this.tabChange.emit(tab);
  }
}