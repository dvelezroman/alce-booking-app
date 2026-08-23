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
  selector: 'app-assessment-config-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './assessment-config-form.component.html',
  styleUrl: './assessment-config-form.component.scss',
})
export class AssessmentConfigFormComponent
  implements OnChanges {

  @Input()
  maxPoints: number | null = null;

  @Output()
  maxPointsChange =
    new EventEmitter<number>();

  value: number | null = null;

  isSaving = false;


  ngOnChanges(
    changes: SimpleChanges,
  ): void {

    if (
      changes['maxPoints']
    ) {
      this.value =
        this.maxPoints;
    }
  }


  get isInvalid(): boolean {

    return (
      this.value === null ||
      this.value === undefined ||
      Number.isNaN(
        Number(this.value),
      ) ||
      Number(this.value) <= 0
    );
  }


  get hasChanges(): boolean {

    if (
      this.value === null ||
      this.maxPoints === null
    ) {
      return false;
    }

    return (
      Number(this.value) !==
      Number(this.maxPoints)
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

    this.maxPointsChange.emit(
      value,
    );
  }
}