import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { UserDto, UserRole, UserStatus } from '../../../services/dtos/user.dto';
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
    userId?: number;
    userRole?: UserRole;
    userStatus?: UserStatus;
    comment?: boolean;
    alert?: boolean;
    stageId?: number;
    newStudents?: boolean;
  }>();

  searchTerm: string = '';
  filteredUsers: UserDto[] = [];
  showUserDropdown: boolean = false;
  searchInput$ = new Subject<string>();
  selectedUser?: UserDto;

  roleFilter: UserRole | null = null;
  statusFilter: UserStatus | null = null;
  commentFilter: boolean | null = null;
  alertFilter: boolean | null = null;

  newStudentsFilter: boolean | null = null;

  constructor(private usersService: UsersService) {
    this.searchInput$
      .pipe(debounceTime(300))
      .subscribe((term: string) => {
        this.filterUsers(term);
      });
  }

  onSearchChange(term: string): void {
    this.searchInput$.next(term);
      if (term.trim() === '') {
        this.selectedUser = undefined;
      }
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
    this.selectedUser = user;
    this.searchTerm = `${user.firstName} ${user.lastName}`;
    this.filteredUsers = [];
    this.showUserDropdown = false;
    //console.log('Usuario seleccionado:', user);
  }

  hideDropdown(): void {
    setTimeout(() => {
      this.showUserDropdown = false;
    }, 200);
  }

  searchUserReport(): void {
    const filters = {
      userId: this.selectedUser?.id,
      userRole: this.selectedUser?.role ?? this.roleFilter ?? undefined,
      userStatus: this.statusFilter ?? undefined,
      comment: this.commentFilter ?? undefined,
      alert: this.alertFilter ?? undefined,
      newStudents: this.newStudentsFilter ?? undefined
    };

   // console.log('filtros enviados al padre:', filters);
    this.filtersSubmitted.emit(filters);
  }
}