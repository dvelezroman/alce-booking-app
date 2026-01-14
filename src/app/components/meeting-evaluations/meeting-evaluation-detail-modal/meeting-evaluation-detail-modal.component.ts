import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstructorEvaluation } from '../../../services/dtos/instructor-evaluation.dto';

@Component({
  selector: 'app-meeting-evaluation-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meeting-evaluation-detail-modal.component.html',
  styleUrl: './meeting-evaluation-detail-modal.component.scss'
})
export class MeetingEvaluationDetailModalComponent {

  @Input() evaluation!: InstructorEvaluation | null;
  @Input() show = false;
  @Input() errorMessage: string | null = null;

  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}