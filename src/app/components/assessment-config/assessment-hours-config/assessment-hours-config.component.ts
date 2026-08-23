import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assessment-hours-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './assessment-hours-config.component.html',
  styleUrl: './assessment-hours-config.component.scss',
})
export class AssessmentHoursConfigComponent
  implements OnChanges {

  @Input()
  minHoursScheduled: number | null = null;

  @Output()
  hoursChange =
    new EventEmitter<number>();

  value: number | null = null;

  isSaving = false;


  ngOnChanges(
    changes: SimpleChanges,
  ): void {

    if (
      changes['minHoursScheduled']
    ) {
      this.value =
        this.minHoursScheduled;
    }
  }


  get isInvalid(): boolean {

    return (
      this.value === null ||
      this.value === undefined ||
      Number.isNaN(
        Number(this.value),
      ) ||
      Number(this.value) < 1
    );
  }


  get hasChanges(): boolean {

    if (
      this.value === null ||
      this.minHoursScheduled === null
    ) {
      return false;
    }

    return (
      Number(this.value) !==
      Number(this.minHoursScheduled)
    );
  }


  save(): void {

    if (
      this.isInvalid ||
      !this.hasChanges
    ) {
      return;
    }

    const value =
      Number(this.value);

    this.hoursChange.emit(
      value,
    );
  }
}