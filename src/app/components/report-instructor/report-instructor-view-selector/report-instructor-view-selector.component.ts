import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';

export type ReportInstructorView =
  | 'main'
  | 'summary'
  | 'summaryByDay';

@Component({
  selector: 'app-report-instructor-view-selector',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './report-instructor-view-selector.component.html',
  styleUrl: './report-instructor-view-selector.component.scss',
})
export class ReportInstructorViewSelectorComponent {

  /* =========================
     INPUTS
  ========================= */

  private _activeView: ReportInstructorView =
    'main';

  @Input()
  set activeView(
    value: ReportInstructorView,
  ) {
    this._activeView = value;
  }

  get activeView(): ReportInstructorView {
    return this._activeView;
  }


  /* =========================
     OUTPUTS
  ========================= */

  @Output() mainRequested =
    new EventEmitter<void>();

  @Output() summaryRequested =
    new EventEmitter<void>();

  @Output() summaryByDayRequested =
    new EventEmitter<void>();


  /* =========================
     ACTIONS
  ========================= */

  selectMain(): void {
    this.mainRequested.emit();
  }

  selectSummary(): void {
    this.summaryRequested.emit();
  }

  selectSummaryByDay(): void {
    this.summaryByDayRequested.emit();
  }
}