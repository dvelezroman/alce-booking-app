import { Component, OnInit } from '@angular/core';
import { FilterMeetingsDto, MeetingDTO } from '../../services/dtos/booking.dto';
import { UserDto } from '../../services/dtos/user.dto';
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
  meetings: MeetingDTO[] = [];
  selectedInstructorId: number | undefined;
  searchAttempted = false;
  isNameFieldInvalid: boolean = false;

  filter = {
    instructorName: '',
    from: '',
    to: ''
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

  selectInstructor(instructor: UserDto) {
    this.filter.instructorName = `${instructor.firstName} ${instructor.lastName}`;
    this.selectedInstructorId = instructor.instructor?.id;
    this.showDropdown = false;
  }

  hideDropdown() {
    setTimeout(() => (this.showDropdown = false), 200);
  }

  loadInstructors() {
    this.usersService.searchUsers(1, 100, undefined, undefined, undefined, undefined, 'INSTRUCTOR')
      .subscribe({
        next: (result) => {
          this.instructors = result.users;
          console.log('Instructores cargados:', this.instructors);
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
      from: this.filter.from || undefined,
      to: this.filter.to || undefined,
      instructorId: this.selectedInstructorId?.toString()
    };

    this.fetchMeetings(filterParams);
  }

  private fetchMeetings(params: FilterMeetingsDto) {
    // Simulación de datos hasta que se complete el servicio
    this.searchAttempted = true;
  }
}
