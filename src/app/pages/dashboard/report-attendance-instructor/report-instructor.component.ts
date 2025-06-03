import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../services/booking.service';
import { InstructorAttendanceDto, FilterMeetingsDto } from '../../../services/dtos/booking.dto';
import { MeetingThemeDto } from '../../../services/dtos/meeting-theme.dto';
import { UserDto, UserRole } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';
import { convertToLocalTimeZone } from '../../../shared/utils/dates.util';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ReportsService } from '../../../services/reports.service';
import { AttendanceDailySummaryComponent } from '../../../components/attendance-instructor/attendance-daily-summary/attendance-daily-summary.component';
import { AttendanceSummaryByDayComponent } from '../../../components/attendance-instructor/attendance-summary-by-day/attendance-summary-by-day.component';

@Component({
  selector: 'app-report-instructor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    AttendanceDailySummaryComponent,
    AttendanceSummaryByDayComponent
  ],
  templateUrl: './report-instructor.component.html',
  styleUrl: './report-instructor.component.scss'
})
export class ReportInstructorComponent implements OnInit {
  instructors: UserDto[] = [];
  filteredInstructors: UserDto[] = [];
  meetings: InstructorAttendanceDto[] = [];
  selectedInstructorId: number | undefined;
  searchAttempted = false;
  isNameFieldInvalid: boolean = false;
  selectedMeeting: MeetingThemeDto | null = null;
  attendanceSummary: { localdate: string, localhour: number, count: number }[] = [];
  isSearchSuccessful: boolean = false;
  activeView: 'main' | 'summary' | 'summaryByDay' = 'main';
  modal: ModalDto = modalInitializer();

  filter = {
    instructorName: '',
    from: new Date().toISOString().substring(0, 10),
    to: '',
    present: 'true',
  };
  showDropdown: boolean = false;

  constructor(private usersService: UsersService,
              private bookingService: BookingService,
              private reportsService: ReportsService
              ) {}

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

              this.isSearchSuccessful = true;
        },
        error: (error) => {
            console.error("Error al obtener las reuniones:", error);
        }
    });
  }

  loadInstructorDailySummary(): void {
    if (!this.selectedInstructorId) return;

    this.reportsService
      .getInstructorAssistanceGroupedByReport(
        this.selectedInstructorId,
        this.filter.from,
        this.filter.to
      )
      .subscribe({
        next: (result) => {
          this.attendanceSummary = result as any;
        },
        error: (error) => {
          console.error('Error al cargar resumen diario:', error);
        }
      });
  }

  validateInstructorSelected(): boolean {
    this.isNameFieldInvalid = false;

    if (!this.filter.instructorName || !this.selectedInstructorId) {
      this.isNameFieldInvalid = true;
      return false;
    }

    return true;
  }

  handleViewMeetings(): void {
    if (!this.validateInstructorSelected()) return;
    this.searchInstructorAttendance();
    this.activeView = 'main';
  }

  handleViewSummary(): void {
    if (!this.validateInstructorSelected()) return;
    this.loadInstructorDailySummary();
    this.activeView = 'summary';
  }

  handleViewSummaryByDay(): void {
    if (!this.validateInstructorSelected()) return;
    this.loadInstructorDailySummary();
    this.activeView = 'summaryByDay';
  }

  onInstructorInputChange(): void {
    this.filterInstructors();
    this.isNameFieldInvalid = !this.filter.instructorName?.trim();
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
