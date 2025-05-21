import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { UsersService } from '../../services/users.service';
import { AssessmentType } from '../../services/dtos/assessment.dto';
import { UserDto } from '../../services/dtos/user.dto';

@Component({
  selector: 'app-assessment-report-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-report-form.component.html',
  styleUrls: ['./assessment-report-form.component.scss']
})
export class AssessmentReportFormComponent {
  @Output() searchTriggered = new EventEmitter<{
    studentId: number;
    stageId: number;
    type: AssessmentType | null;
  }>();

  searchTerm: string = '';
  filteredUsers: UserDto[] = [];
  selectedStudent?: UserDto;
  showUserDropdown: boolean = false;
  searchInput$ = new Subject<string>();

  assessmentTypes = Object.values(AssessmentType);
  type: AssessmentType | null = null;

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
  }

  hideDropdown(): void {
    setTimeout(() => {
      this.showUserDropdown = false;
    }, 200);
  }

  triggerSearch(): void {
    if (
      !this.selectedStudent?.student?.id ||
      !this.selectedStudent?.student?.stageId
    ) {
      this.showStudentRequiredError = true;
      return;
    }

    this.showStudentRequiredError = false;

    const payload = {
      studentId: this.selectedStudent.student.id,
      stageId: this.selectedStudent.student.stageId,
      type: this.type
    };

    this.searchTriggered.emit(payload);
  }
}