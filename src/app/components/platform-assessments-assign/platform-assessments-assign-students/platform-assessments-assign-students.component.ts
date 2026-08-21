import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  FormsModule,
} from '@angular/forms';


export interface SelectedPlatformAssessmentStudent {
  studentId: number;
  name: string;
  email?: string;
  stageNumber?: string;
}


@Component({
  selector: 'app-platform-assessments-assign-students',
  standalone: true,
  imports: [
    FormsModule,
  ],
  templateUrl: './platform-assessments-assign-students.component.html',
  styleUrl: './platform-assessments-assign-students.component.scss',
})
export class PlatformAssessmentsAssignStudentsComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  idNumberSearch = '';

  @Input()
  studentIdSearch = '';

  @Input()
  selected: SelectedPlatformAssessmentStudent[] = [];


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  idNumberSearchChange =
    new EventEmitter<string>();

  @Output()
  studentIdSearchChange =
    new EventEmitter<string>();

  @Output()
  addByIdNumberRequested =
    new EventEmitter<void>();

  @Output()
  addByStudentIdRequested =
    new EventEmitter<void>();

  @Output()
  removeStudentRequested =
    new EventEmitter<number>();


  /* =========================
     EVENTS
  ========================= */

  onIdNumberChange(
    value: string,
  ): void {
    this.idNumberSearchChange.emit(
      value,
    );
  }


  onStudentIdChange(
    value: string,
  ): void {
    this.studentIdSearchChange.emit(
      value,
    );
  }


  onAddByIdNumber(): void {
    this.addByIdNumberRequested.emit();
  }


  onAddByStudentId(): void {
    this.addByStudentIdRequested.emit();
  }


  onRemoveStudent(
    studentId: number,
  ): void {
    this.removeStudentRequested.emit(
      studentId,
    );
  }


  /* =========================
     DISPLAY
  ========================= */

  getStageLabel(
    student: SelectedPlatformAssessmentStudent,
  ): string {
    if (!student.stageNumber) {
      return 'Sin stage';
    }

    const stage =
      String(
        student.stageNumber,
      )
        .trim();

    if (
      stage
        .toUpperCase()
        .startsWith('STG')
    ) {
      return stage;
    }

    if (
      stage
        .toLowerCase()
        .startsWith('stage')
    ) {
      return stage;
    }

    return `Stage ${stage}`;
  }

}