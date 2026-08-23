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
  selector: 'app-assessment-days-config-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './assessment-days-config-form.component.html',
  styleUrl: './assessment-days-config-form.component.scss',
})
export class AssessmentDaysConfigFormComponent
  implements OnChanges {

  @Input()
  daysAsNewStudent: number | null = null;

  @Output()
  daysChange =
    new EventEmitter<number>();

  value: number | null = null;

  isSaving = false;


  ngOnChanges(
    changes: SimpleChanges,
  ): void {

    if (
      changes['daysAsNewStudent']
    ) {
      this.value =
        this.daysAsNewStudent;
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
      this.daysAsNewStudent === null
    ) {
      return false;
    }

    return (
      Number(this.value) !==
      Number(this.daysAsNewStudent)
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

    this.daysChange.emit(
      value,
    );
  }
}