import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  FormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-platform-assessment-writing-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './platform-assessment-writing-modal.component.html',
  styleUrl: './platform-assessment-writing-modal.component.scss',
})
export class PlatformAssessmentWritingModalComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  show = false;

  @Input()
  studentName = '';

  @Input()
  currentPoints: number | null = null;

  @Input()
  submitting = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  closeRequested =
    new EventEmitter<void>();

  @Output()
  confirmRequested =
    new EventEmitter<number>();


  /* =========================
     STATE
  ========================= */

  points: number | null = null;


  /* =========================
     CHANGE
  ========================= */

  onPointsChange(
    value: number | string,
  ): void {
    const parsed =
      Number(value);

    this.points =
      Number.isFinite(parsed)
        ? parsed
        : null;
  }


  /* =========================
     CONFIRM
  ========================= */

  onConfirm(): void {
    if (
      this.points === null ||
      this.points < 0 ||
      this.submitting
    ) {
      return;
    }

    this.confirmRequested.emit(
      this.points,
    );
  }


  /* =========================
     CLOSE
  ========================= */

  onClose(): void {
    if (this.submitting) {
      return;
    }

    this.closeRequested.emit();
  }


  /* =========================
     INIT VALUE
  ========================= */

  ngOnChanges(): void {
    if (this.show) {
      this.points =
        this.currentPoints ?? 0;
    }
  }

}