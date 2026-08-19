import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Stage } from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-active-students-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './active-students-filters.component.html',
  styleUrl: './active-students-filters.component.scss',
})
export class ActiveStudentsFiltersComponent {

  @Input() stages: Stage[] = [];
  @Input() stageId: number | null = null;
  @Input() noClasses = false;
  @Input() loading = false;

  @Output() stageIdChange =
    new EventEmitter<number | null>();

  @Output() noClassesChange =
    new EventEmitter<boolean>();

  @Output() generateRequested =
    new EventEmitter<void>();


  onStageChange(
    value: number | null,
  ): void {
    const stageId =
      value !== null &&
      value !== undefined &&
      value !== ('' as any)
        ? Number(value)
        : null;

    this.stageIdChange.emit(
      stageId,
    );
  }


  onNoClassesChange(
    value: boolean,
  ): void {
    this.noClassesChange.emit(
      value,
    );
  }


  onGenerate(): void {
    if (this.loading) {
      return;
    }

    this.generateRequested.emit();
  }


  getStageLabel(
    stage: Stage,
  ): string {
    return (
      stage.number ||
      `Stage ${stage.id}`
    );
  }
}