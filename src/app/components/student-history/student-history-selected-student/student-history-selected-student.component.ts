import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { UserDto } from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-student-history-selected-student',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-history-selected-student.component.html',
  styleUrl: './student-history-selected-student.component.scss'
})
export class StudentHistorySelectedStudentComponent {
  @Input() student?: UserDto;

  get fullName(): string {
    if (!this.student) return '';

    return [
      this.student.firstName,
      this.student.lastName
    ]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Estudiante';
  }

  get initials(): string {
    if (!this.student) return 'ES';

    const firstName =
      this.student.firstName?.trim()?.charAt(0) || '';

    const lastName =
      this.student.lastName?.trim()?.charAt(0) || '';

    return `${firstName}${lastName}`.toUpperCase() || 'ES';
  }

  get email(): string {
    return (
      this.student?.emailAddress ||
      this.student?.email ||
      'Sin correo'
    );
  }

  get studentId(): string {
    return this.student?.student?.id
      ? String(this.student.student.id)
      : '—';
  }

  get stage(): string {
    const student = this.student?.student as any;

    const value =
      student?.stage?.stageNumber ??
      student?.stage?.number ??
      student?.currentStage?.stageNumber ??
      student?.currentStage?.number ??
      student?.stageId;

    return value
      ? `Stage ${value}`
      : 'Sin stage';
  }

  get modality(): string {
    const student = this.student?.student as any;

    return (
      student?.modality ||
      student?.mode ||
      'Sin información'
    );
  }

  get classification(): string {
    const student = this.student?.student as any;

    return (
      student?.classification ||
      student?.category ||
      'Sin información'
    );
  }

  get city(): string {
    const user = this.student as any;

    return (
      user?.city ||
      user?.address?.city ||
      user?.student?.city ||
      'Sin información'
    );
  }
}