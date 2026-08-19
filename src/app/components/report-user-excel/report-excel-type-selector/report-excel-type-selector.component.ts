import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export type ReportExcelMode =
  | 'users'
  | 'absents'
  | 'without-meetings';

@Component({
  selector: 'app-report-excel-type-selector',
  standalone: true,
  imports: [],
  templateUrl: './report-excel-type-selector.component.html',
  styleUrl: './report-excel-type-selector.component.scss',
})
export class ReportExcelTypeSelectorComponent {

  @Input() currentMode: ReportExcelMode =
    'users';

  @Output() modeSelected =
    new EventEmitter<ReportExcelMode>();

  selectMode(
    mode: ReportExcelMode,
  ): void {
    if (mode === this.currentMode) {
      return;
    }

    this.modeSelected.emit(mode);
  }

  isSelected(
    mode: ReportExcelMode,
  ): boolean {
    return this.currentMode === mode;
  }
}