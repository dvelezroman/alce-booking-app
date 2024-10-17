import { Component, OnInit } from '@angular/core';
import { FilterMeetingsDto, MeetingDTO } from '../../services/dtos/booking.dto';
import {UserDto, UserRole} from '../../services/dtos/user.dto';
import { UsersService } from '../../services/users.service';
import { BookingService } from '../../services/booking.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  meetings: { date: string, hour: number, instructorId: number, meetings: MeetingDTO[] }[] = [];
  selectedInstructorId: number | undefined;
  searchAttempted = false;
  isNameFieldInvalid: boolean = false;

  filter = {
    instructorName: '',
    from: new Date().toISOString().substring(0, 10),
    to: '',
    present: 'yes',
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
            console.log("Reuniones recibidas:", meetings);
            this.meetings = meetings;
        },
        error: (error) => {
            console.error("Error al obtener las reuniones:", error);
        }
    });
}
}
