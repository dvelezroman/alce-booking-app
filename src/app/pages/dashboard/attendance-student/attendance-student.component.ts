import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

import { BookingService } from '../../../services/booking.service';
import {
  MeetingDTO,
  FilterMeetingsDto,
} from '../../../services/dtos/booking.dto';
import { MeetingThemeDto } from '../../../services/dtos/meeting-theme.dto';
import {
  UserDto,
  UserRole,
} from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';

import { convertToLocalTimeZone } from '../../../shared/utils/dates.util';

/* =========================
   CHILD COMPONENTS
========================= */

import { AttendanceStudentHeaderComponent } from '../../../components/attendance-student/attendance-student-header/attendance-student-header.component';
import { AttendanceStudentFiltersComponent } from '../../../components/attendance-student/attendance-student-filters/attendance-student-filters.component';
import { AttendanceStudentSummaryComponent } from '../../../components/attendance-student/attendance-student-summary/attendance-student-summary.component';
import { AttendanceStudentTableComponent } from '../../../components/attendance-student/attendance-student-table/attendance-student-table.component';
import { AttendanceStudentInfoComponent } from '../../../components/attendance-student/attendance-student-info/attendance-student-info.component';
import { AttendanceStudentThemeModalComponent } from '../../../components/attendance-student/attendance-student-theme-modal/attendance-student-theme-modal.component';
import { AttendanceStudentPaginationComponent } from '../../../components/attendance-student/attendance-student-pagination/attendance-student-pagination.component';


@Component({
  selector: 'app-attendance-student',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    AttendanceStudentHeaderComponent,
    AttendanceStudentFiltersComponent,
    AttendanceStudentSummaryComponent,
    AttendanceStudentTableComponent,
    AttendanceStudentInfoComponent,
    AttendanceStudentThemeModalComponent,
    AttendanceStudentPaginationComponent,
  ],
  templateUrl: './attendance-student.component.html',
  styleUrl: './attendance-student.component.scss',
})
export class AttendanceStudentComponent implements OnInit {

  /* =========================
     DATA
  ========================= */

  availableHours: number[] = [];
  students: UserDto[] = [];
  filteredStudents: UserDto[] = [];
  meetings: MeetingDTO[] = [];


  /* =========================
     SELECTED STUDENT
  ========================= */

  selectedStudentId: number | undefined;
  selectedStudentName: string = '';


  /* =========================
     STATES
  ========================= */

  searchAttempted = false;
  isNameFieldInvalid: boolean = false;
  showDropdown: boolean = false;


  /* =========================
     THEME MODAL
  ========================= */

  isModalOpen: boolean = false;
  selectedMeeting: (MeetingThemeDto & { instructorName?: string }) | null = null;


  /* =========================
     FILTER
  ========================= */

  filter = {
    studentName: '',
    from: '',
    to: '',
    hour: '',
  };


  /* =========================
     SEARCH
  ========================= */

  searchInput$ = new Subject<string>();

   /* =========================
    PAGINATION
  ========================= */
  
  currentPage: number = 1;
  itemsPerPage: number = 8;

  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private usersService: UsersService,
    private bookingService: BookingService,
  ) {
    this.searchInput$
      .pipe(
        debounceTime(300),
      )
      .subscribe((term: string) => {
        this.fetchFilteredStudents(term);
      });
  }


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.availableHours = Array.from(
      { length: 13 },
      (_, i) => 8 + i,
    );
  }


  /* =========================
     STUDENT SEARCH
  ========================= */

  onStudentInputChange(term: string): void {
    this.searchInput$.next(term);
  }


  fetchFilteredStudents(term: string): void {
    const query = term
      .trim()
      .toLowerCase();

    if (query.length < 2) {
      this.filteredStudents = [];
      this.showDropdown = false;

      return;
    }

    this.usersService
      .searchUsers(
        0,
        20,
        undefined,
        query,
        query,
        undefined,
        UserRole.STUDENT,
      )
      .subscribe({
        next: (res) => {
          this.filteredStudents = res.users;

          this.showDropdown =
            this.filteredStudents.length > 0;
        },

        error: () => {
          this.filteredStudents = [];
          this.showDropdown = false;
        },
      });
  }


  selectStudent(user: UserDto): void {
    this.filter.studentName =
      `${user.firstName} ${user.lastName}`;

    this.selectedStudentId =
      user.student?.id;

    this.selectedStudentName =
      this.filter.studentName;

    this.filteredStudents = [];

    this.showDropdown = false;
  }


  hideDropdown(): void {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }


  /* =========================
     ATTENDANCE SEARCH
  ========================= */

  searchAttendance(): void {
    this.isNameFieldInvalid = false;
    this.searchAttempted = false;
    this.currentPage = 1;

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

    setTimeout(() => {
      this.searchAttempted = true;
    }, 1000);

    this.fetchMeetings(filterParams);
  }


  /* =========================
     MEETINGS
  ========================= */

  private fetchMeetings(
    params: FilterMeetingsDto,
  ): void {
    this.bookingService
      .searchMeetings(params)
      .subscribe({
        next: (
          meetings: MeetingDTO[],
        ) => {
          this.meetings =
            meetings.sort(
              (a, b) =>
                new Date(b.date).getTime() -
                new Date(a.date).getTime(),
            );
        },

        error: (error) => {
          console.error(
            'Error al obtener las reuniones:',
            error,
          );
        },
      });
  }

  /* =========================
    PAGINATION
  ========================= */

  get totalPages(): number {
    return Math.ceil(this.meetings.length / this.itemsPerPage);
  }

  get paginatedMeetings(): MeetingDTO[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    return this.meetings.slice(start, end);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
  }


  /* =========================
     THEME MODAL
  ========================= */

  openThemeModal(meeting: MeetingDTO): void {
    const firstName = meeting.instructor?.user?.firstName || '';
    const lastName = meeting.instructor?.user?.lastName || '';

    const instructorName = [firstName, lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    this.selectedMeeting = {
      meetingThemeId: meeting.meetingThemeId,
      stageId: meeting.stageId,
      instructorId: meeting.instructorId,
      date: meeting.date,
      hour: meeting.hour,
      description: meeting.meetingTheme?.description || '',
      instructorName: instructorName || 'Sin instructor',
    };

    this.isModalOpen = true;
  }


  closeThemeModal(): void {
    this.isModalOpen = false;

    this.selectedMeeting = null;
  }


  /* =========================
     HELPERS
  ========================= */

  isFutureDate(
    date: Date | string,
  ): boolean {
    const meetingDate =
      new Date(date);

    const currentDate =
      convertToLocalTimeZone(
        new Date().toString(),
      );

    return meetingDate > currentDate;
  }
}