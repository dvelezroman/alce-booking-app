import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../services/booking.service';
import { InstructorAttendanceDto, FilterMeetingsDto } from '../../../services/dtos/booking.dto';
import { MeetingThemeDto } from '../../../services/dtos/meeting-theme.dto';
import { UserDto, UserRole } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';
import { convertToLocalTimeZone } from '../../../shared/utils/dates.util';

@Component({
  selector: 'app-attendance-instructor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './attendance-instructor.component.html',
  styleUrl: './attendance-instructor.component.scss'
})
export class AttendanceInstructorComponent implements OnInit {
  instructors: UserDto[] = [];
  filteredInstructors: UserDto[] = [];
  meetings: InstructorAttendanceDto[] = [];
  selectedInstructorId: number | undefined;
  searchAttempted = false;
  isNameFieldInvalid: boolean = false;

  isModalOpen: boolean = false;
  selectedMeeting: MeetingThemeDto | null = null;

  filter = {
    instructorName: '',
    from: new Date().toISOString().substring(0, 10),
    to: '',
    present: 'true',
  };
  showDropdown: boolean = false;

  constructor(private usersService: UsersService,
              private bookingService: BookingService) {}

  ngOnInit() {
    this.loadInstructors();
  }

  filterInstructors() {
    const query = this.filter.instructorName.trim().toLowerCase();
    if (query.length > 0) {
      this.filteredInstructors = this.instructors.filter(instructor =>
        (instructor.firstName + ' ' + instructor.lastName).toLowerCase().includes(query)
      );
      this.showDropdown = true;
    } else {
      this.filteredInstructors = [];
      this.showDropdown = false;
    }
  }

  selectInstructor(user: UserDto) {
    this.filter.instructorName = `${user.firstName} ${user.lastName}`;
    this.selectedInstructorId = user.instructor?.id;
    this.showDropdown = false;
  }

  hideDropdown() {
    setTimeout(() => (this.showDropdown = false), 200);
  }

  loadInstructors() {
    this.usersService.searchUsers(0, 100, undefined, undefined, undefined, undefined, UserRole.INSTRUCTOR)
      .subscribe({
        next: (result) => {
          this.instructors = result.users;
        },
        error: (error) => {
          console.error('Error al cargar instructores:', error);
        }
      });
  }

  searchInstructorAttendance() {
    this.isNameFieldInvalid = false;
    this.searchAttempted = false;

    if (!this.filter.instructorName || !this.selectedInstructorId) {
        this.isNameFieldInvalid = true;
        return;
    }
    const filterParams: FilterMeetingsDto = {
        from: this.filter.from || new Date().toISOString(),
        to: this.filter.to || undefined,
        instructorId: this.selectedInstructorId?.toString(),
        assigned: true,
        present: this.filter.present,
    };

    // console.log("Parámetros de búsqueda enviados:", filterParams);

    this.fetchMeetings(filterParams);
  }

  private fetchMeetings(params: FilterMeetingsDto) {
    this.searchAttempted = true;
    this.bookingService.getInstructorMeetingsGroupedByHour(params).subscribe({
        next: (meetings) => {
            //console.log("Reuniones recibidas:", meetings);
            this.meetings = meetings.sort((a: InstructorAttendanceDto, b: InstructorAttendanceDto) => 
              new Date(a.date).getTime() - new Date(b.date).getTime());
        },
        error: (error) => {
            console.error("Error al obtener las reuniones:", error);
        }
    });
  }

  openThemeModal(meeting: InstructorAttendanceDto) {
    this.selectedMeeting = {
      date: new Date(meeting.date),
      description: meeting.meetings[0].meetingTheme?.description || '',
      hour: meeting.hour,
      instructorId: meeting.instructorId
    };
    this.isModalOpen = true;
  }

  closeThemeModal(): void {
    this.isModalOpen = false;
    this.selectedMeeting = null;
  }

  isFutureDate(date: Date | string): boolean {
    const meetingDate = new Date(date);
    const currentDate = convertToLocalTimeZone(new Date().toString());

    return meetingDate > currentDate;
  }
}
