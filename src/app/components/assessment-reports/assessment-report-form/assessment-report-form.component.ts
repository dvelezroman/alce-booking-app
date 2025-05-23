import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { UsersService } from '../../../services/users.service';
import { AssessmentType } from '../../../services/dtos/assessment.dto';
import { UserDto } from '../../../services/dtos/user.dto';
import { Stage } from '../../../services/dtos/student.dto';
import { StagesService } from '../../../services/stages.service';

@Component({
  selector: 'app-assessment-report-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-report-form.component.html',
  styleUrls: ['./assessment-report-form.component.scss']
})
export class AssessmentReportFormComponent {
  @Output() searchTriggered = new EventEmitter<{
    studentId: number | null;
    stageId: number;
    type: AssessmentType | null;
  }>();

  stages: Stage[] = [];
  selectedStageId: number | null = null;
  searchTerm: string = '';
  filteredUsers: UserDto[] = [];
  selectedStudent?: UserDto;
  showUserDropdown: boolean = false;
  searchInput$ = new Subject<string>();

  assessmentTypes = Object.values(AssessmentType);
  type: AssessmentType | null = null;

  showStudentRequiredError = false;
  showStageRequiredError = false;

  constructor(private usersService: UsersService, private stagesService: StagesService) {
    this.searchInput$.pipe(debounceTime(300)).subscribe((term: string) => {
      this.filterUsers(term);
    });
  }

   ngOnInit(): void {
    this.stagesService.getAll().subscribe({
      next: (response) => {
        this.stages = response;
      },
      error: () => {
        console.error('Error al cargar stages');
      }
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
  const studentId = this.selectedStudent?.student?.id ?? null;
  const studentStageId = this.selectedStudent?.student?.stageId ?? null;

  this.showStageRequiredError = !studentStageId && !this.selectedStageId;
  if (this.showStageRequiredError) return;

  const payload = {
    studentId,
    stageId: studentStageId ?? this.selectedStageId!,
    type: this.type
  };

  this.searchTriggered.emit(payload);
}
}