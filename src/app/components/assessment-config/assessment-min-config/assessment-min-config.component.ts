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
  selector: 'app-assessment-min-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './assessment-min-config.component.html',
  styleUrl: './assessment-min-config.component.scss',
})
export class AssessmentMinConfigComponent
  implements OnChanges {

  @Input()
  minPoints: number | null = null;

  @Output()
  minPointsChange =
    new EventEmitter<number>();

  value: number | null = null;

  isSaving = false;


  ngOnChanges(
    changes: SimpleChanges,
  ): void {

    if (
      changes['minPoints']
    ) {
      this.value =
        this.minPoints;
    }
  }


  get isInvalid(): boolean {

    return (
      this.value === null ||
      this.value === undefined ||
      Number.isNaN(
        Number(this.value),
      ) ||
      Number(this.value) < 0
    );
  }


  get hasChanges(): boolean {

    if (
      this.value === null ||
      this.minPoints === null
    ) {
      return false;
    }

    return (
      Number(this.value) !==
      Number(this.minPoints)
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

    this.minPointsChange.emit(
      value,
    );
  }
}