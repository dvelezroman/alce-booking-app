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
  selector: 'app-assessment-max-days-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-max-days-config.component.html',
  styleUrl: './assessment-max-days-config.component.scss',
})
export class AssessmentMaxDaysConfigComponent implements OnChanges {
  @Input() maxDaysInCurrentStage: number | null = null;
  @Output() daysChange = new EventEmitter<number>();

  value: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['maxDaysInCurrentStage']) {
      this.value = this.maxDaysInCurrentStage;
    }
  }

  get isInvalid(): boolean {
    return (
      this.value === null ||
      this.value === undefined ||
      Number.isNaN(Number(this.value)) ||
      Number(this.value) < 1
    );
  }

  get hasChanges(): boolean {
    if (this.value === null || this.maxDaysInCurrentStage === null) {
      return false;
    }
    return Number(this.value) !== Number(this.maxDaysInCurrentStage);
  }

  save(): void {
    if (this.isInvalid || !this.hasChanges) {
      return;
    }
    this.daysChange.emit(Number(this.value));
  }
}
