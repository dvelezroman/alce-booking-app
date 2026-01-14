import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PendingMeetingEvaluation } from '../../../services/dtos/instructor-evaluation.dto';

@Component({
  selector: 'app-pending-evaluations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-evaluations.component.html',
  styleUrl: './pending-evaluations.component.scss'
})
export class PendingEvaluationsComponent {

  @Input() meetings: PendingMeetingEvaluation[] = [];
  @Input() loading = false;

  @Output() evaluate = new EventEmitter<PendingMeetingEvaluation>();

  onEvaluateClick(meeting: PendingMeetingEvaluation): void {
    this.evaluate.emit(meeting);
  }
}