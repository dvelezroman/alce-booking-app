import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserDto } from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-report-student-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './report-student-filter.component.html',
  styleUrl: './report-student-filter.component.scss'
})
export class ReportStudentFilterComponent {

  @Input() filteredStudents: UserDto[] = [];
  @Input() showStudentDropdown = false;
  @Input() isStudentFieldInvalid = false;

  @Output() filtersSubmitted = new EventEmitter<{
    studentId: number;
    from?: string;
    to?: string;
    stageId?: number;
  }>();

  @Output() studentInputChange = new EventEmitter<string>();
  @Output() studentSelected = new EventEmitter<UserDto>();
  @Output() studentDropdownHidden = new EventEmitter<void>();

  studentId: number | null = null;
  studentName = '';
  from = '';
  to = '';
  stageId: number | null = null;

  onStudentInputChange(term: string): void {
    this.studentName = term;
    this.studentId = null;
    this.studentInputChange.emit(term);
  }

  onSelectStudent(user: UserDto): void {
    this.studentName = this.getStudentFullName(user);
    this.studentId = this.getStudentIdValue(user);
    this.studentSelected.emit(user);
  }

  onStudentInputBlur(): void {
    setTimeout(() => {
      this.studentDropdownHidden.emit();
    }, 150);
  }

  submitFilters(): void {
    if (!this.studentId) return;

    this.filtersSubmitted.emit({
      studentId: this.studentId,
      from: this.from || undefined,
      to: this.to || undefined,
      stageId: this.stageId || undefined
    });
  }

  clearStudent(): void {
    this.studentId = null;
    this.studentName = '';
    this.studentInputChange.emit('');
  }

  getStudentFullName(user: UserDto): string {
    return [
      user.firstName,
      user.lastName
    ]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Sin nombre';
  }

  getStudentInitials(user: UserDto): string {
    const firstName =
      user.firstName
        ?.trim()
        ?.charAt(0) || '';

    const lastName =
      user.lastName
        ?.trim()
        ?.charAt(0) || '';

    return (
      `${firstName}${lastName}`
        .toUpperCase() ||
      'E'
    );
  }

  getStudentIdentification(user: UserDto): string {
    return (
      user.idNumber ||
      String(user.id)
    );
  }

  private getStudentIdValue(user: UserDto): number {
    if (user.student?.id) {
      return Number(user.student.id);
    }

    return Number(user.id);
  }
}