import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InstructorAttendanceDto } from '../../../services/dtos/booking.dto';
import { MeetingThemeDto } from '../../../services/dtos/meeting-theme.dto';
import { UserDto, UserRole } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';
import { convertToLocalTimeZone } from '../../../shared/utils/dates.util';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ReportsService } from '../../../services/reports.service';
import { AttendanceDailySummaryComponent } from '../../../components/attendance-instructor/attendance-daily-summary/attendance-daily-summary.component';
import { AttendanceSummaryByDayComponent } from '../../../components/attendance-instructor/attendance-summary-by-day/attendance-summary-by-day.component';
import { InstructorGroupedData, InstructorsGroupedByDate } from '../../../services/dtos/instructor-attendance-grouped.dto';

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
  groupedMeetingsByDate: InstructorsGroupedByDate = {};
  selectedInstructorId: number | undefined;
  searchAttempted = false;
  isNameFieldInvalid: boolean = false;
  showFromError: boolean = false;
  showToError: boolean = false;
  selectedMeeting: MeetingThemeDto | null = null;
  attendanceSummary: { localdate: string, localhour: number, count: number }[] = [];
  isSearchSuccessful: boolean = false;
  activeView: 'main' | 'summary' | 'summaryByDay' = 'main';
  currentDateIndex = 0;
  availableDates: string[] = [];

  modal: ModalDto = modalInitializer();

  filter = {
    instructorName: '',
    from: new Date().toISOString().substring(0, 10),
    to: '',
    present: 'true',
  };
  showDropdown: boolean = false;

  constructor(private usersService: UsersService,
              private reportsService: ReportsService) {}

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

  searchInstructorAttendance(): void {
    this.isNameFieldInvalid = false;
    this.searchAttempted = false;

    this.showFromError = !this.filter.from;
    this.showToError = !this.filter.to;

    if (this.showFromError || this.showToError) {
      return;
    }

    this.fetchMeetings(this.filter.from, this.filter.to);
  }

  private fetchMeetings(from?: string, to?: string): void {
    this.searchAttempted = true;

    this.reportsService.getInstructorsMeetingsGroupedByHour(from || '', to || '').subscribe({
      next: (response: InstructorsGroupedByDate) => {
        this.groupedMeetingsByDate = response;
        this.availableDates = Object.keys(response).sort(); 
        this.currentDateIndex = 0;

        this.isSearchSuccessful = true;
      },
      error: (error) => {
        console.error('Error al obtener las reuniones:', error);
      }
    });
  }

  prevDate(): void {
    if (this.currentDateIndex > 0) {
      this.currentDateIndex--;
    }
  }

  nextDate(): void {
    if (this.currentDateIndex < this.availableDates.length - 1) {
      this.currentDateIndex++;
    }
  }

  getUniqueStagesCount(instructor: InstructorGroupedData): number {
    const stageIds = new Set<number>();

    instructor.user.hours?.forEach(hour => {
      hour.stages?.forEach(stage => {
        if (stage.stageId !== undefined) {
          stageIds.add(stage.stageId);
        }
      });
    });

    return stageIds.size;
  }

  loadInstructorDailySummary(): void {
    this.isNameFieldInvalid = !this.filter.instructorName?.trim() || !this.selectedInstructorId;
    this.showFromError = !this.filter.from;
    this.showToError = !this.filter.to;

    if (this.isNameFieldInvalid || this.showFromError || this.showToError) {
      return;
    }

    this.reportsService
      .getInstructorAssistanceGroupedByReport(
        this.selectedInstructorId!,
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

  downloadInstructorHoursCsv(): void {
    this.showFromError = !this.filter.from;
    this.showToError = !this.filter.to;

    if (this.showFromError || this.showToError) {
      return;
    }

    this.reportsService.getInstructorsMeetingsGroupedByHourCsv(this.filter.from, this.filter.to).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte_horas_instructores_${this.filter.from}_a_${this.filter.to}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error: (error) => {
        console.error('Error al descargar CSV:', error);
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

  isGroupedMeetingsEmpty(): boolean {
    return Object.keys(this.groupedMeetingsByDate).length === 0;
  }

showInstructorDetail(instructor: InstructorGroupedData): void {
  const sortedHours = [...instructor.user.hours].sort((a, b) => a.localhour - b.localhour);

  const hourDetails = sortedHours
    .map(h => ` <p>Hora: ${h.localhour}:00 - ${h.stages.map(s => s.description).join(', ')}</p>`)
    .join('');

  this.modal = {
    ...modalInitializer(),
    show: true,
    isContentViewer: true,
    title: `Detalle de horas: ${instructor.user.firstName}`,
    message: hourDetails,
    close: () => this.closeModal()
  };
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