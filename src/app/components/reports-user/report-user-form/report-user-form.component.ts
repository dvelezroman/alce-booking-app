import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { UserDto } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-user-form.component.html',
  styleUrls: ['./report-user-form.component.scss']
})
export class ReportFormComponent {
  @Output() filtersSubmitted = new EventEmitter<{
    studentId: number;
    studentStage?: string;
    status?: 'active' | 'inactive' | null;
    withAlerts?: boolean | null;
  }>();

  searchTerm: string = '';
  filteredUsers: UserDto[] = [];
  showUserDropdown: boolean = false;
  searchInput$ = new Subject<string>();
  selectedStudent?: UserDto;

  showStudentRequiredError: boolean = false;

  statusFilter: 'active' | 'inactive' | null = null;
  alertFilter: boolean | null = null;

  constructor(private usersService: UsersService) {
    this.searchInput$
      .pipe(debounceTime(300))
      .subscribe((term: string) => {
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

  searchStudentProgress(): void {
    if (!this.selectedStudent?.student?.id) {
      this.showStudentRequiredError = true;
      return;
    }

    this.showStudentRequiredError = false;

    this.filtersSubmitted.emit({
      studentId: this.selectedStudent.student.id,
      studentStage: this.selectedStudent.student.stage?.description ?? undefined,
      status: this.statusFilter,
      withAlerts: this.alertFilter
    });
  }
}