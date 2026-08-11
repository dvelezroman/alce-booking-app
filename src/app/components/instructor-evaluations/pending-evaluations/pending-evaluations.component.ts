import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  PendingMeetingEvaluation
} from '../../../services/dtos/instructor-evaluation.dto';
import { PendingEvaluationCardComponent } from "../pending-evaluation-card/pending-evaluation-card.component";

@Component({
  selector: 'app-pending-evaluations',
  standalone: true,
  imports: [
    CommonModule,
    PendingEvaluationCardComponent
],
  templateUrl: './pending-evaluations.component.html',
  styleUrl: './pending-evaluations.component.scss'
})
export class PendingEvaluationsComponent {

  @Input()
  meetings: PendingMeetingEvaluation[] = [];

  @Input()
  loading = false;

  @Output()
  evaluate =
    new EventEmitter<PendingMeetingEvaluation>();

  get hasMeetings(): boolean {
    return this.meetings.length > 0;
  }

  get meetingsCount(): number {
    return this.meetings.length;
  }

  onEvaluate(
    meeting: PendingMeetingEvaluation
  ): void {
    this.evaluate.emit(meeting);
  }

  trackByMeetingId(
    _index: number,
    meeting: PendingMeetingEvaluation
  ): number {
    return meeting.id;
  }
}