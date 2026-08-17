import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeetingDTO } from '../../../services/dtos/booking.dto';
import { UserDto, UserRole } from '../../../services/dtos/user.dto';
import { BookingService } from '../../../services/booking.service';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-instructor-created-meetings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './instructor-created-meetings.component.html',
  styleUrl: './instructor-created-meetings.component.scss',
})
export class InstructorCreatedMeetingsComponent implements OnInit {
  instructors: UserDto[] = [];
  filteredInstructors: UserDto[] = [];
  meetings: MeetingDTO[] = [];
  selectedInstructorId?: number;
  searchAttempted = false;
  isLoading = false;
  showFromError = false;
  showToError = false;
  showDropdown = false;

  filter = {
    instructorName: '',
    from: new Date().toISOString().substring(0, 10),
    to: new Date().toISOString().substring(0, 10),
  };

  constructor(
    private bookingService: BookingService,
    private usersService: UsersService,
  ) {}

  ngOnInit(): void {
    this.loadInstructors();
  }

  loadInstructors(): void {
    this.usersService
      .searchUsers(0, 100, undefined, undefined, undefined, undefined, UserRole.INSTRUCTOR)
      .subscribe({
        next: (result) => {
          this.instructors = result.users;
        },
        error: (error) => {
          console.error('Error al cargar instructores:', error);
        },
      });
  }

  filterInstructors(): void {
    const query = this.filter.instructorName.trim().toLowerCase();
    if (query.length > 0) {
      this.filteredInstructors = this.instructors.filter((instructor) =>
        `${instructor.firstName} ${instructor.lastName}`.toLowerCase().includes(query),
      );
      this.showDropdown = true;
    } else {
      this.filteredInstructors = [];
      this.showDropdown = false;
      this.selectedInstructorId = undefined;
    }
  }

  onInstructorInputChange(): void {
    this.filterInstructors();
    if (!this.filter.instructorName.trim()) {
      this.selectedInstructorId = undefined;
    }
  }

  selectInstructor(user: UserDto): void {
    this.filter.instructorName = `${user.firstName} ${user.lastName}`;
    this.selectedInstructorId = user.instructor?.id;
    this.showDropdown = false;
  }

  hideDropdown(): void {
    setTimeout(() => (this.showDropdown = false), 200);
  }

  searchMeetings(): void {
    this.showFromError = !this.filter.from;
    this.showToError = !this.filter.to;

    if (this.showFromError || this.showToError) {
      return;
    }

    this.searchAttempted = true;
    this.isLoading = true;

    this.bookingService
      .searchMeetings({
        from: this.filter.from,
        to: this.filter.to,
        createdByInstructor: true,
        instructorId: this.selectedInstructorId?.toString(),
      })
      .subscribe({
        next: (meetings) => {
          this.meetings = meetings.sort(
            (a, b) =>
              new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
          );
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar meetings creados por instructor:', error);
          this.meetings = [];
          this.isLoading = false;
        },
      });
  }

  getInstructorName(meeting: MeetingDTO): string {
    const instructor = meeting.instructor?.user;
    if (instructor) {
      return `${instructor.lastName}, ${instructor.firstName}`;
    }
    const assignedBy = meeting.assignedBy;
    if (assignedBy) {
      return `${assignedBy.lastName}, ${assignedBy.firstName}`;
    }
    return '—';
  }

  getStudentName(meeting: MeetingDTO): string {
    const student = meeting.student?.user;
    if (!student) {
      return '—';
    }
    return `${student.lastName}, ${student.firstName}`;
  }

  formatMeetingDate(meeting: MeetingDTO): string {
    if (!meeting.localdate) {
      return '—';
    }
    const date = new Date(meeting.localdate);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    return date.toISOString().substring(0, 10);
  }

  getMeetingHour(meeting: MeetingDTO): number {
    return meeting.localhour ?? meeting.hour;
  }

  formatCreatedAt(meeting: MeetingDTO): string {
    if (!meeting.createdAt) {
      return '—';
    }
    return new Date(meeting.createdAt).toLocaleString('es-EC');
  }
}
