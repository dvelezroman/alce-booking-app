import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { UserDto } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';
import { AssessmentType, CreateAssessmentI } from '../../../services/dtos/assessment.dto';

@Component({
  selector: 'app-assessment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-form.component.html',
  styleUrls: ['./assessment-form.component.scss'],
})
export class AssessmentFormComponent {
  showPointsError = false;
  showCommentBox = false;
  showTypeRequiredError = false;

  @Input() blockedTypes: AssessmentType[] = [];
  @Input() instructorId: number | null = null;
  @Output() assessmentCreated = new EventEmitter<CreateAssessmentI>();
  @Output() studentSelected = new EventEmitter<{ studentId: number, stageId: number, instructorId: number }>();

  searchTerm: string = '';
  filteredUsers: UserDto[] = [];
  selectedStudent?: UserDto;
  showUserDropdown: boolean = false;
  searchInput$ = new Subject<string>();
  
  assessmentTypes = Object.values(AssessmentType); 
  type: AssessmentType | null = null;
  points: number | null = null;
  note: string = '';

  showStudentRequiredError = false;

  constructor(private usersService: UsersService) {
    this.searchInput$.pipe(debounceTime(300)).subscribe((term: string) => {
      this.filterUsers(term);
    });
  }

  onSearchChange(term: string): void {
    this.searchInput$.next(term);
  }

  filterUsers(term: string): void {
    if (!term || term.trim().length < 2) {
      this.filteredUsers = [];
      this.showUserDropdown = false;
      return;
    }

    this.usersService.searchUsers(undefined, undefined, undefined, term, term, undefined).subscribe({
      next: (result) => {
        this.filteredUsers = result.users;
        this.showUserDropdown = true;
      },
      error: () => {
        this.filteredUsers = [];
        this.showUserDropdown = false;
      }
    });
  }

  selectUser(user: UserDto): void {
    this.selectedStudent = user;
    this.searchTerm = `${user.firstName} ${user.lastName}`;
    this.filteredUsers = [];
    this.showUserDropdown = false;
    this.showStudentRequiredError = false;
    this.note = '';
    this.points = null;
    this.showCommentBox = false;

    if (user.student?.id && user.student?.stage?.id && this.instructorId !== null) {
      this.studentSelected.emit({
        studentId: user.student.id,
        stageId: user.student.stage.id,
        instructorId: this.instructorId
      });
    }
  }

  hideDropdown(): void {
    setTimeout(() => {
      this.showUserDropdown = false;
    }, 200);
  }

  get isBelowThreshold(): boolean {
    return this.points !== null && this.points < 80;
  }

  private isPointsInvalid(): boolean {
    return (
      this.points === null ||
      isNaN(this.points) ||
      this.points < 0 ||
      this.points > 100
    );
  }

  submitAssessment(typeControl?: NgModel): void {
    if (typeControl && typeControl.invalid) {
      typeControl.control.markAsTouched();
    }

    const student = this.selectedStudent?.student;
    const stageId = student?.stage?.id;
    const studentId = student?.id;

    const isStudentValid = !!studentId && !!stageId;
    const isTypeValid = this.type !== null && !this.blockedTypes.includes(this.type);

    this.showStudentRequiredError = !isStudentValid;

    if (!isStudentValid || !isTypeValid) return;

    if (this.isPointsInvalid()) {
      this.showPointsError = true;
      return;
    }

    this.showPointsError = false;

    const payload: CreateAssessmentI = {
      studentId: studentId!,
      stageId: stageId!,
      instructorId: this.instructorId!,
      type: this.type!,
      points: this.points!,
      note: this.note || ''
    };

    this.assessmentCreated.emit(payload);
    this.resetForm();
  }

  private resetForm(): void {
    this.note = '';
    this.points = null;
    this.type = null;
    this.showCommentBox = false;
  }
}