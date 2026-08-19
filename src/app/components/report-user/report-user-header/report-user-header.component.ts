import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-report-user-header',
  standalone: true,
  imports: [],
  templateUrl: './report-user-header.component.html',
  styleUrl: './report-user-header.component.scss',
})
export class ReportUserHeaderComponent {

  @Output() exportRequested =
    new EventEmitter<void>();

  @Output() generateRequested =
    new EventEmitter<void>();


  onExport(): void {
    this.exportRequested.emit();
  }


  onGenerate(): void {
    this.generateRequested.emit();
  }
}