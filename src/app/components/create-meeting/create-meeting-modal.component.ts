import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { UserDto } from '../../services/dtos/user.dto';
import { UsersService } from '../../services/users.service';
import { CreateMeetingDto } from '../../services/dtos/booking.dto';
import { convertEcuadorDateToLocal, convertEcuadorHourToLocal, getTimezoneOffsetHours } from '../../shared/utils/dates.util';
import { StudentClassification } from '../../services/dtos/student.dto';

@Component({
  selector: 'app-create-meeting-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-meeting-modal.component.html',
  styleUrls: ['./create-meeting-modal.component.scss']
})

export class CreateMeetingModalComponent implements OnInit {
  @Output() meetingCreated = new EventEmitter<CreateMeetingDto>();
  @Output() close = new EventEmitter<void>();
  @Input() fromDate?: string;
  @Input() from?: string;
  @Input() to?: string;
  @Input() hour?: string;
  @Input() instructorId?: number;

  searchTerm: string = '';
  filteredUsers: UserDto[] = [];
  selectedStudent?: UserDto;
  showUserDropdown: boolean = false;
  searchInput$ = new Subject<string>();
  showErrorToast = false;
  errorToastMessage = '';


  constructor(private usersService: UsersService) {
    this.searchInput$
      .pipe(debounceTime(300))
      .subscribe((term: string) => {
        this.filterUsers(term);
      });
  }

  ngOnInit(): void {
    // console.log('Instructor ID:', this.instructorId);
    // console.log('Fecha:', this.fromDate);
    // console.log('Hora:', this.hour);
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
  }

  hideDropdown(): void {
    setTimeout(() => {
      this.showUserDropdown = false;
    }, 200);
  }

  createMeeting(): void {
    if (!this.selectedStudent || !this.instructorId || !this.fromDate || !this.hour) {
      this.errorToastMessage = 'Faltan datos para crear la reunión';
      this.showErrorToast = true;
  
      setTimeout(() => {
        this.showErrorToast = false;
      }, 3000);
      return;
    }
  
    const [year, month, day] = this.fromDate.split('-').map(Number);
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    const formattedHour = this.hour.toString().padStart(2, '0');
  
    const formattedDate = `${year}-${formattedMonth}-${formattedDay}T${formattedHour}:00:00-05:00`;
  
    const date = getTimezoneOffsetHours() !== 0
      ? convertEcuadorDateToLocal(formattedDate)
      : formattedDate;
  
    const hour = getTimezoneOffsetHours() !== 0
      ? convertEcuadorHourToLocal(Number(this.hour))
      : Number(this.hour);
  
    const meeting: CreateMeetingDto = {
      studentId: this.selectedStudent.student!.id,
      instructorId: this.instructorId,
      stageId: this.selectedStudent.student!.stageId,
      date,
      hour,
      localdate: formattedDate,
      localhour: Number(this.hour),
      mode: this.selectedStudent.student!.mode,
      category: this.selectedStudent.student!.studentClassification ?? StudentClassification.ADULTS,
    };
  
    this.meetingCreated.emit(meeting);
  }
} 
