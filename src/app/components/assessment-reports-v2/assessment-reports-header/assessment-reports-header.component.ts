import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assessment-reports-header',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './assessment-reports-header.component.html',
  styleUrl: './assessment-reports-header.component.scss',
})
export class AssessmentReportsHeaderComponent {

  @Output() exportRequested =
    new EventEmitter<void>();

  @Output() refreshRequested =
    new EventEmitter<void>();


  onExport(): void {
    this.exportRequested.emit();
  }


  onRefresh(): void {
    this.refreshRequested.emit();
  }
}