import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PendingMeetingEvaluation } from '../../../services/dtos/instructor-evaluation.dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-evaluate-instructor-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './evaluate-instructor-modal.component.html',
  styleUrl: './evaluate-instructor-modal.component.scss'
})
export class EvaluateInstructorModalComponent {

  @Input() show = false;
  @Input() meeting: PendingMeetingEvaluation | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() submitEvaluation = new EventEmitter<{ rating: number; observation?: string; }>();

  ratingOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  hoveredRating: number | null = null;
  selectedRating: number | null = null;

  observation = '';

  // ----------------------
  // RATING INTERACTIONS
  // ----------------------
  onHover(value: number): void {
    this.hoveredRating = value;
  }

  onLeave(): void {
    this.hoveredRating = null;
  }

  selectRating(value: number): void {
    this.selectedRating = value;
  }

  isActive(value: number): boolean {
    return (
      (this.hoveredRating !== null && value <= this.hoveredRating) ||
      (this.selectedRating !== null && value <= this.selectedRating)
    );
  }

  isSelected(value: number): boolean {
    return this.selectedRating === value;
  }

  // ----------------------
  // ACTIONS
  // ----------------------
  submit(): void {
    if (!this.selectedRating) return;

    this.submitEvaluation.emit({
      rating: this.selectedRating,
      observation: this.observation?.trim() || undefined
    });
  }

  private resetForm(): void {
    this.selectedRating = null;
    this.hoveredRating = null;
    this.observation = '';
  }

  cancel(): void {
    this.resetForm();
    this.close.emit();
  }
}