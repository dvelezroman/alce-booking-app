import { Component, EventEmitter, Input, Output, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { UserDto } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-user-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-selector.component.html',
  styleUrls: ['./user-selector.component.scss']
})
export class UserSelectorComponent implements OnChanges {
  @Output() userSelected = new EventEmitter<UserDto>();
  @Input() reset = false;

  searchTerm: string = '';
  filteredUsers: UserDto[] = [];
  selectedUser?: UserDto;
  showUserDropdown: boolean = false;

  private searchInput$ = new Subject<string>();

  constructor(private usersService: UsersService) {
    this.searchInput$
      .pipe(debounceTime(300))
      .subscribe((term: string) => {
        this.filterUsers(term);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reset'] && this.reset) {
      this.clearSelection();
    }
  }

  onSearchChange(term: string): void {
    this.searchInput$.next(term);
    if (term.trim() === '') {
      this.selectedUser = undefined;
      this.userSelected.emit(undefined as any);
    }
  }

  private filterUsers(term: string): void {
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
    this.userSelected.emit(user);
  }

  hideDropdown(): void {
    setTimeout(() => {
      this.showUserDropdown = false;
    }, 200);
  }

  private clearSelection(): void {
    this.selectedUser = undefined;
    this.searchTerm = '';
    this.filteredUsers = [];
    this.showUserDropdown = false;
    this.userSelected.emit(undefined as any);
  }
}