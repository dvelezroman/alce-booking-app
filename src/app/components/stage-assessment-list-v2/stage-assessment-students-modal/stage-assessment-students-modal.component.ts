import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  StageAssessmentStudent,
} from '../../../services/dtos/stage-assessment.dto';


@Component({
  selector: 'app-stage-assessment-students-modal',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './stage-assessment-students-modal.component.html',
  styleUrl: './stage-assessment-students-modal.component.scss',
})
export class StageAssessmentStudentsModalComponent {

  @Input() title = '';
  @Input() students: StageAssessmentStudent[] = [];

  @Output()
  closeRequested =
    new EventEmitter<void>();


  get isFinishedView(): boolean {
    return this.title
      .toLowerCase()
      .includes('finalizaron');
  }


  get totalLabel(): string {
    const total =
      this.students.length;

    if (this.isFinishedView) {
      return `Finalizados: ${total} estudiantes`;
    }

    return `Total asignados: ${total} estudiantes`;
  }


  getStudentInitials(
    student: StageAssessmentStudent,
  ): string {
    return (
      `${student.firstName?.charAt(0) || ''}${student.lastName?.charAt(0) || ''}`
        .toUpperCase() ||
      '—'
    );
  }


  getStudentName(
    student: StageAssessmentStudent,
  ): string {
    return (
      `${student.firstName || ''} ${student.lastName || ''}`
        .trim() ||
      'Estudiante'
    );
  }


  onClose(): void {
    this.closeRequested.emit();
  }
}