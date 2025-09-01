import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  OnChanges,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
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
  styleUrls: ['./user-selector.component.scss'],
})
export class UserSelectorComponent implements OnChanges {
  @Input() role: 'student' | 'instructor' | 'admin' | undefined;
  @Input() stageId: number | undefined;
  @Input() reset = false;

  @Output() usersSelected = new EventEmitter<UserDto[]>();

  @ViewChild('containerRef') containerRef!: ElementRef;

  searchTerm: string = '';
  searchInput$ = new Subject<string>();
  allUsers: UserDto[] = [];
  selectedUsers: UserDto[] = [];

  isDropdownOpen = false;

  private fetchSeq = 0;

  constructor(private usersService: UsersService) {
    this.searchInput$
      .pipe(debounceTime(300))
      .subscribe((term) => this.fetchUsers(term));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reset'] && this.reset) {
      this.clearSelection();
    }

    if (changes['role'] && !changes['role'].firstChange) {
      this.searchTerm = '';
      this.allUsers = [];
      this.selectedUsers = [];
      this.usersSelected.emit([]);
      this.isDropdownOpen = false;

      this.fetchSeq++;
    }

    if (
      this.role === 'student' &&
      changes['stageId'] &&
      changes['stageId'].currentValue !== changes['stageId'].previousValue
    ) {
      this.fetchUsers('');
    }
  }

  onSearchChange(term: string): void {
    this.searchInput$.next(term);
  }

  fetchUsers(term: string): void {
    if (!this.role) {
      this.allUsers = [];
      this.isDropdownOpen = false;
      return;
    }

    const isStudentWithStage = this.role === 'student' && this.stageId;
    const shouldFetch =
      term.trim().length >= 2 ||
      (this.role === 'student' && !!this.stageId) ||
      this.role === 'instructor';
      this.role === 'admin';

    if (!shouldFetch) {
      this.allUsers = [];
      this.isDropdownOpen = false;
      return;
    }

    const seq = ++this.fetchSeq;
    const expectedRole = this.role;
    const expectedStage = this.stageId;

    this.usersService
      .searchUsers(
        undefined,
        undefined,
        undefined,
        term,
        term,
        undefined,
        this.role?.toUpperCase(),
        true,
        isStudentWithStage ? this.stageId : undefined
      )
      .subscribe({
        next: (res) => {
          if (seq !== this.fetchSeq) return;
          if (this.role !== expectedRole) return;
          if (expectedRole === 'student' && this.stageId !== expectedStage) return;
          
          this.allUsers = res.users;
          this.isDropdownOpen = true;
        },
        error: () => {
          this.allUsers = [];
          this.isDropdownOpen = false;
        },
      });
  }

  toggleUserSelection(user: UserDto): void {
    const exists = this.selectedUsers.find((u) => u.id === user.id);
    if (exists) {
      this.selectedUsers = this.selectedUsers.filter((u) => u.id !== user.id);
    } else {
      this.selectedUsers.push(user);
    }
    this.usersSelected.emit(this.selectedUsers);
  }

  isSelected(user: UserDto): boolean {
    return this.selectedUsers.some((u) => u.id === user.id);
  }

  clearSelection(): void {
    this.selectedUsers = [];
    this.searchTerm = '';
    this.allUsers = [];
    this.usersSelected.emit([]);
    this.isDropdownOpen = false;
  }

  onInputFocus(): void {
    const shouldPreload =
      (this.role === 'student' && this.stageId) ||
      this.role === 'instructor';
      this.role === 'admin';

    if (shouldPreload && this.allUsers.length === 0) {
      this.fetchUsers('');
    }

    this.isDropdownOpen = true;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.containerRef?.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  removeUser(user: UserDto): void {
    this.selectedUsers = this.selectedUsers.filter((u) => u.id !== user.id);
    this.usersSelected.emit(this.selectedUsers);
  }
}