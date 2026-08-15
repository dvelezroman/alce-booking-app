import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, Subject } from 'rxjs';

import { BookingService } from '../../../services/booking.service';
import {
  InstructorAttendanceDto,
  FilterMeetingsDto,
} from '../../../services/dtos/booking.dto';
import {
  UserDto,
  UserRole,
} from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';

import { convertToLocalTimeZone } from '../../../shared/utils/dates.util';

import { ModalComponent } from '../../../components/modal/modal.component';
import {
  ModalDto,
  modalInitializer,
} from '../../../components/modal/modal.dto';

/* =========================
   CHILD COMPONENTS
========================= */

import { AttendanceInstructorHeaderComponent } from '../../../components/attendance-instructor-v2/attendance-instructor-header/attendance-instructor-header.component';
import { AttendanceInstructorFiltersComponent } from '../../../components/attendance-instructor-v2/attendance-instructor-filters/attendance-instructor-filters.component';
import { AttendanceInstructorSummaryComponent } from '../../../components/attendance-instructor-v2/attendance-instructor-summary/attendance-instructor-summary.component';
import { AttendanceInstructorTableComponent } from '../../../components/attendance-instructor-v2/attendance-instructor-table/attendance-instructor-table.component';
import { AttendanceInstructorInfoComponent } from '../../../components/attendance-instructor-v2/attendance-instructor-info/attendance-instructor-info.component';
import { AttendanceInstructorPaginationComponent } from '../../../components/attendance-instructor-v2/attendance-instructor-pagination/attendance-instructor-pagination.component';
import { AttendanceInstructorContentModalComponent } from '../../../components/attendance-instructor-v2/attendance-instructor-content-modal/attendance-instructor-content-modal.component';

@Component({
  selector: 'app-attendance-instructor-v2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,

    AttendanceInstructorHeaderComponent,
    AttendanceInstructorFiltersComponent,
    AttendanceInstructorSummaryComponent,
    AttendanceInstructorTableComponent,
    AttendanceInstructorInfoComponent,
    AttendanceInstructorPaginationComponent,
    AttendanceInstructorContentModalComponent,
  ],
  templateUrl: './attendance-instructor-v2.component.html',
  styleUrl: './attendance-instructor-v2.component.scss',
})
export class AttendanceInstructorV2Component implements OnInit {

  filteredInstructors: UserDto[] = [];

  meetings: InstructorAttendanceDto[] = [];

  selectedInstructorId: number | undefined;

  searchAttempted = false;

  isNameFieldInvalid: boolean = false;

  modal: ModalDto = modalInitializer();

  filter = {
    instructorName: '',
    from: new Date().toISOString().substring(0, 10),
    to: '',
    present: 'true',
  };

  showDropdown: boolean = false;

  searchInput$ = new Subject<string>();

  currentPage: number = 1;
  itemsPerPage: number = 10;


  constructor(
    private usersService: UsersService,
    private bookingService: BookingService
  ) {
    this.searchInput$
      .pipe(
        debounceTime(300)
      )
      .subscribe((term: string) => {
        this.fetchFilteredInstructors(term);
      });
  }


  ngOnInit(): void {}


  onInstructorInputChange(term: string): void {
    this.searchInput$.next(term);
  }


  fetchFilteredInstructors(term: string): void {
    const query = term.trim().toLowerCase();

    if (query.length < 2) {
      this.filteredInstructors = [];
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
        UserRole.INSTRUCTOR
      )
      .subscribe({
        next: (res) => {
          this.filteredInstructors = res.users;

          this.showDropdown =
            this.filteredInstructors.length > 0;
        },

        error: () => {
          this.filteredInstructors = [];
          this.showDropdown = false;
        }
      });
  }


  selectInstructor(user: UserDto): void {
    this.filter.instructorName =
      `${user.firstName} ${user.lastName}`;

    this.selectedInstructorId =
      user.instructor?.id;

    this.filteredInstructors = [];

    this.showDropdown = false;
  }


  hideDropdown(): void {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }


  searchInstructorAttendance(): void {
    this.isNameFieldInvalid = false;
    this.searchAttempted = false;
    this.currentPage = 1;

    if (
      !this.filter.instructorName ||
      !this.selectedInstructorId
    ) {
      this.isNameFieldInvalid = true;
      return;
    }

    const filterParams: FilterMeetingsDto = {
      from:
        this.filter.from ||
        new Date().toISOString(),

      to:
        this.filter.to ||
        undefined,

      instructorId:
        this.selectedInstructorId?.toString(),

      assigned: true,

      present:
        this.filter.present,
    };

    this.fetchMeetings(filterParams);
  }


  private fetchMeetings(
    params: FilterMeetingsDto
  ): void {
    this.searchAttempted = true;

    this.bookingService
      .getInstructorMeetingsGroupedByHour(params)
      .subscribe({
        next: (
          meetings: InstructorAttendanceDto[]
        ) => {
          this.meetings =
            meetings.sort(
              (a, b) =>
                new Date(a.date).getTime() -
                new Date(b.date).getTime()
            );
        },

        error: (error) => {
          console.error(
            'Error al obtener las reuniones:',
            error
          );
        }
      });
  }


  showContent(
    meeting: InstructorAttendanceDto
  ): void {
    if (
      !meeting.meetings[0].studyContent ||
      meeting.meetings[0].studyContent.length === 0
    ) {
      this.modal = {
        ...modalInitializer(),
        show: true,
        isContentViewer: true,
        message:
          'No hay contenido disponible para esta clase.',
        title:
          'Sin Contenido',
        close:
          () => this.closeModal()
      };

      return;
    }

    const contentHtml =
      meeting.meetings[0].studyContent
        .map(
          c =>
            `<p><span style="font-weight: bold;">Unidad ${c.unit}:</span> ${c.title}</p>`
        )
        .join('');

    this.modal = {
      ...modalInitializer(),
      show: true,
      isContentViewer: true,
      message: contentHtml,
      title: 'Contenidos de la Clase',
      close: () => this.closeModal()
    };
  }


  closeModal(): void {
    this.modal.show = false;
  }


  isFutureDate(
    date: Date | string
  ): boolean {
    const meetingDate =
      new Date(date);
    const currentDate =
      convertToLocalTimeZone(
        new Date().toString()
      );
    return meetingDate > currentDate;
  }

 /* =========================
    PAGINATION
  ========================= */

  private getDateKey(item: InstructorAttendanceDto): string {
    const value = item.localdate || item.date;
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }


  /**
   * Construye páginas respetando los grupos por fecha.
   *
   * itemsPerPage funciona como cantidad objetivo de clases,
   * pero nunca divide las clases de un mismo día entre páginas.
   */
  get meetingPages(): InstructorAttendanceDto[][] {
    if (this.meetings.length === 0) {
      return [];
    }

    /* =========================
      GROUP BY DATE
    ========================= */

    const groups = new Map<string, InstructorAttendanceDto[]>();

    const sortedMeetings = [...this.meetings].sort((a, b) => {
      const dateA = new Date(a.localdate || a.date).getTime();
      const dateB = new Date(b.localdate || b.date).getTime();

      if (dateA !== dateB) {
        return dateB - dateA;
      }

      return (
        Number(b.localhour ?? b.hour) -
        Number(a.localhour ?? a.hour)
      );
    });

    sortedMeetings.forEach((meeting) => {
      const key = this.getDateKey(meeting);

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key)!.push(meeting);
    });


    /* =========================
      BUILD PAGES
    ========================= */

    const pages: InstructorAttendanceDto[][] = [];
    let currentPageItems: InstructorAttendanceDto[] = [];

    groups.forEach((dayMeetings) => {

      const wouldExceedLimit =
        currentPageItems.length > 0 &&
        currentPageItems.length + dayMeetings.length > this.itemsPerPage;

      if (wouldExceedLimit) {
        pages.push(currentPageItems);
        currentPageItems = [];
      }

      currentPageItems.push(...dayMeetings);
    });


    if (currentPageItems.length > 0) {
      pages.push(currentPageItems);
    }

    return pages;
  }


  get totalPages(): number {
    return this.meetingPages.length;
  }


  get paginatedMeetings(): InstructorAttendanceDto[] {
    return this.meetingPages[this.currentPage - 1] ?? [];
  }


  changePage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.currentPage = page;
  }
}