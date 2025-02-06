import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserDto } from '../../services/dtos/user.dto';
import { UsersService } from '../../services/users.service';
import { FilterMeetingsDto, MeetingDTO } from '../../services/dtos/booking.dto';
import { BookingService } from '../../services/booking.service';
import {MeetingThemeDto} from "../../services/dtos/meeting-theme.dto";
import {convertToLocalTimeZone} from "../../shared/utils/dates.util";

@Component({
  selector: 'app-attendance-reports',
  standalone: true,
  imports: [
      CommonModule,
      FormsModule
  ],
  templateUrl: './attendance-reports.component.html',
  styleUrl: './attendance-reports.component.scss'
})
export class AttendanceReportsComponent implements OnInit {
  availableHours: number[] = [];
  students: UserDto[] = [];
  filteredStudents: UserDto[] = [];
  meetings: MeetingDTO[] = [];
  selectedStudentId: number | undefined;
  selectedStudentName: string = '';
  searchAttempted = false;
  isNameFieldInvalid: boolean = false;
  isModalOpen: boolean = false;
  selectedMeeting: MeetingThemeDto | null = null;

  filter = {
    studentName: '',
    from: '',
    to: '',
    hour: ''
  };
  showDropdown: boolean = false;
  constructor(private usersService: UsersService,
              private bookingService: BookingService
  ) {}

  ngOnInit() {
    this.availableHours = Array.from({ length: 13 }, (_, i) => 8 + i);
    this.loadStudents();
    this.filteredStudents = [...this.students];

  }

  filterStudents() {
    const query = this.filter.studentName.trim().toLowerCase();

    if (query.length > 0 && query !== this.selectedStudentName?.toLowerCase()) {
      this.filteredStudents = this.students.filter(student =>
        (student.firstName + ' ' + student.lastName).toLowerCase().includes(query)
      );
      this.showDropdown = true;
    } else {
      this.filteredStudents = [];
      this.showDropdown = false;
    }
  }

  selectStudent(user: UserDto) {
    this.filter.studentName = `${user.firstName} ${user.lastName}`;
    this.selectedStudentId = user.student?.id;
    this.selectedStudentName = this.filter.studentName;
    this.showDropdown = false;
  }

  hideDropdown() {
    setTimeout(() => (this.showDropdown = false), 200);
  }

  loadStudents() {
    this.usersService.searchUsers(0, undefined, undefined, undefined, undefined, undefined, 'STUDENT')
      .subscribe({
        next: (result) => {
          this.students = result.users;
          //console.log('Estudiantes cargados:', this.students);
        },
        error: (error) => {
          console.error('Error al cargar estudiantes:', error);
        }
      });
  }

  searchAttendance() {
    this.isNameFieldInvalid = false;
    this.searchAttempted = false;

    if (!this.filter.studentName || !this.selectedStudentId) {
      this.isNameFieldInvalid = true;
      return;
  }
    const filterParams: FilterMeetingsDto = {
      from: this.filter.from || undefined,
      to: this.filter.to || undefined,
      hour: this.filter.hour ? String(this.filter.hour) : undefined,
      studentId: this.selectedStudentId,
      assigned: true,
    };
    //console.log("Parámetros enviados al servicio:", filterParams);
    setTimeout(() => {
      this.searchAttempted = true;
    }, 1000);

    this.fetchMeetings(filterParams);
}

  private fetchMeetings(params: FilterMeetingsDto) {
      this.bookingService.searchMeetings(params).subscribe({
        next: (meetings) => {
          //console.log("Reuniones recibidas:", meetings);
           this.meetings = meetings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        },
        error: (error) => {
          console.error("Error al obtener las reuniones:", error);
        }
      });
  }

  isFutureDate(date: Date | string): boolean {
    const meetingDate = new Date(date);
    const currentDate = convertToLocalTimeZone(new Date().toString());

    return meetingDate > currentDate;
  }

  openThemeModal(meeting: MeetingDTO) {
    this.selectedMeeting = {
      meetingThemeId: meeting.meetingThemeId,
      stageId: meeting.stageId,
      instructorId: meeting.instructorId,
      date: meeting.date,
      hour: meeting.hour,
      description: meeting.meetingTheme ? meeting.meetingTheme.description : ''
    };
    this.isModalOpen = true;
  }

  closeThemeModal(): void {
    this.isModalOpen = false;
    this.selectedMeeting = null;
  }
}
