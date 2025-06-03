import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, Subject } from 'rxjs';
import { BookingService } from '../../../services/booking.service';
import { InstructorAttendanceDto, FilterMeetingsDto } from '../../../services/dtos/booking.dto';
import { UserDto, UserRole } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';
import { convertToLocalTimeZone } from '../../../shared/utils/dates.util';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';

@Component({
  selector: 'app-attendance-instructor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent
  ],
  templateUrl: './attendance-instructor.component.html',
  styleUrl: './attendance-instructor.component.scss'
})
export class AttendanceInstructorComponent implements OnInit {
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

  constructor(
    private usersService: UsersService,
    private bookingService: BookingService
  ) {
    this.searchInput$
      .pipe(debounceTime(300))
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
      .searchUsers(0, 20, undefined, query, query, undefined, UserRole.INSTRUCTOR)
      .subscribe({
        next: (res) => {
          this.filteredInstructors = res.users;
          this.showDropdown = this.filteredInstructors.length > 0;
        },
        error: () => {
          this.filteredInstructors = [];
          this.showDropdown = false;
        }
      });
  }

  selectInstructor(user: UserDto): void {
    this.filter.instructorName = `${user.firstName} ${user.lastName}`;
    this.selectedInstructorId = user.instructor?.id;
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

    this.fetchMeetings(filterParams);
  }

  private fetchMeetings(params: FilterMeetingsDto): void {
    this.searchAttempted = true;

    this.bookingService.getInstructorMeetingsGroupedByHour(params).subscribe({
      next: (meetings: InstructorAttendanceDto[]) => {
        this.meetings = meetings.sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      },
      error: (error) => {
        console.error("Error al obtener las reuniones:", error);
      }
    });
  }

  showContent(meeting: InstructorAttendanceDto): void {
    if (!meeting.meetings[0].studyContent || meeting.meetings[0].studyContent.length === 0) {
      this.modal = {
        ...modalInitializer(),
        show: true,
        isContentViewer: true,
        message: 'No hay contenido disponible para esta clase.',
        title: 'Sin Contenido',
        close: () => this.closeModal()
      };
      return;
    }

    const contentHtml = meeting.meetings[0].studyContent
      .map(c => `<p><span style="font-weight: bold;">Unidad ${c.unit}:</span> ${c.title}</p>`)
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

  isFutureDate(date: Date | string): boolean {
    const meetingDate = new Date(date);
    const currentDate = convertToLocalTimeZone(new Date().toString());

    return meetingDate > currentDate;
  }
}