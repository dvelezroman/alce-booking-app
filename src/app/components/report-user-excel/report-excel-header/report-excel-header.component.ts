import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-report-excel-header',
  standalone: true,
  imports: [],
  templateUrl: './report-excel-header.component.html',
  styleUrl: './report-excel-header.component.scss',
})
export class ReportExcelHeaderComponent {

  @Output() helpRequested =
    new EventEmitter<void>();

  onHelp(): void {
    this.helpRequested.emit();
  }
}