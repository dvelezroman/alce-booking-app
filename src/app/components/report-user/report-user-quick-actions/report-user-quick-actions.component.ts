import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-report-user-quick-actions',
  standalone: true,
  imports: [],
  templateUrl: './report-user-quick-actions.component.html',
  styleUrl: './report-user-quick-actions.component.scss',
})
export class ReportUserQuickActionsComponent {

  @Output() stagesRequested =
    new EventEmitter<void>();

  @Output() commentsRequested =
    new EventEmitter<void>();

  @Output() alertsRequested =
    new EventEmitter<void>();


  onStages(): void {
    this.stagesRequested.emit();
  }

  onComments(): void {
    this.commentsRequested.emit();
  }

  onAlerts(): void {
    this.alertsRequested.emit();
  }
}