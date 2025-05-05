import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { UserDto } from '../../services/dtos/user.dto';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-create-meeting-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-meeting-modal.component.html',
  styleUrls: ['./create-meeting-modal.component.scss']
})

export class CreateMeetingModalComponent implements OnInit {
  @Output() studentSelected = new EventEmitter<UserDto>();
  @Output() close = new EventEmitter<void>();
  @Input() fromDate?: string;
  @Input() from?: string;
  @Input() to?: string;
  @Input() hour?: string;
  @Input() instructorId?: number;

  searchTerm: string = '';
  filteredUsers: UserDto[] = [];
  showUserDropdown: boolean = false;
  searchInput$ = new Subject<string>();

  constructor(private usersService: UsersService) {
    this.searchInput$
      .pipe(debounceTime(300))
      .subscribe((term: string) => {
        this.filterUsers(term);
      });
  }

  ngOnInit(): void {
    console.log('Instructor ID:', this.instructorId);
    console.log('Fecha desde:', this.from);
    console.log('Fecha hasta:', this.to);
    console.log('Hora:', this.hour);
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
    this.searchTerm = `${user.firstName} ${user.lastName}`;
    this.filteredUsers = [];
    this.showUserDropdown = false;
    this.studentSelected.emit(user);
  }

  hideDropdown(): void {
    setTimeout(() => {
      this.showUserDropdown = false;
    }, 200);
  }
} 
