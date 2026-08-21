import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  FormsModule,
} from '@angular/forms';


@Component({
  selector: 'app-platform-assessments-assign-window',
  standalone: true,
  imports: [
    FormsModule,
  ],
  templateUrl: './platform-assessments-assign-window.component.html',
  styleUrl: './platform-assessments-assign-window.component.scss',
})
export class PlatformAssessmentsAssignWindowComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  expiresLocal = '';

  @Input()
  maxAttempts = 1;

  @Input()
  submitting = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  expiresLocalChange =
    new EventEmitter<string>();

  @Output()
  maxAttemptsChange =
    new EventEmitter<number>();

  @Output()
  submitRequested =
    new EventEmitter<void>();


  /* =========================
     EVENTS
  ========================= */

  onExpiresLocalChange(
    value: string,
  ): void {
    this.expiresLocalChange.emit(
      value,
    );
  }


  onMaxAttemptsChange(
    value: number | string,
  ): void {
    const attempts =
      Number(value);

    this.maxAttemptsChange.emit(
      Number.isFinite(attempts)
        ? attempts
        : 1,
    );
  }


  onSubmit(): void {
    if (this.submitting) {
      return;
    }

    this.submitRequested.emit();
  }

}