import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InstructorAttendanceDto } from '../../../services/dtos/booking.dto';
import { MeetingThemeDto } from '../../../services/dtos/meeting-theme.dto';
import { UserDto, UserRole } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';
import { convertToLocalTimeZone } from '../../../shared/utils/dates.util';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ReportsService } from '../../../services/reports.service';

import {
  InstructorGroupedData,
  InstructorsGroupedByDate,
} from '../../../services/dtos/instructor-attendance-grouped.dto';

/* =========================
   NEW CHILD COMPONENTS
========================= */

import { ReportInstructorHeaderComponent } from '../../../components/report-instructor/report-instructor-header/report-instructor-header.component';
import { ReportInstructorFiltersComponent } from '../../../components/report-instructor/report-instructor-filters/report-instructor-filters.component';
import { ReportInstructorViewSelectorComponent } from '../../../components/report-instructor/report-instructor-view-selector/report-instructor-view-selector.component';
import { ReportInstructorClassDetailComponent } from '../../../components/report-instructor/report-instructor-class-detail/report-instructor-class-detail.component';
import { ReportInstructorDetailComponent } from '../../../components/report-instructor/report-instructor-detail/report-instructor-detail.component';
import { ReportInstructorHourDetailComponent } from '../../../components/report-instructor/report-instructor-hour-detail/report-instructor-hour-detail.component';
import { ReportInstructorQuickActionsComponent } from '../../../components/report-instructor/report-instructor-quick-actions/report-instructor-quick-actions.component';
import { ReportInstructorDailySummaryComponent } from '../../../components/report-instructor/report-instructor-daily-summary/report-instructor-daily-summary.component';
import { ReportInstructorDaySummaryComponent } from '../../../components/report-instructor/report-instructor-day-summary/report-instructor-day-summary.component';

@Component({
  selector: 'app-report-instructor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,

    ReportInstructorHeaderComponent,
    ReportInstructorFiltersComponent,
    ReportInstructorViewSelectorComponent,
    ReportInstructorClassDetailComponent,
    ReportInstructorDetailComponent,
    ReportInstructorHourDetailComponent,
    ReportInstructorQuickActionsComponent,
    ReportInstructorDailySummaryComponent,
    ReportInstructorDaySummaryComponent,
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

  /* =========================
     NEW UI STATE
  ========================= */

  selectedInstructorDetail: InstructorGroupedData | null = null;

  modal: ModalDto = modalInitializer();

  filter = {
    instructorName: '',
    from: new Date().toISOString().substring(0, 10),
    to: '',
    present: 'true',
  };

  showDropdown: boolean = false;

  constructor(
    private usersService: UsersService,
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
    this.usersService.searchUsers(
      0,
      100,
      undefined,
      undefined,
      undefined,
      undefined,
      UserRole.INSTRUCTOR
    )
      .subscribe({
        next: (result) => {
          this.instructors = result.users;
        },
        error: (error) => {
          console.error('Error al cargar instructores:', error);
        }
      });
  }

  handleSearchRequested(): void {
    if (this.activeView === 'main') {
      this.searchInstructorAttendance();
      return;
    }

    if (
      this.activeView === 'summary' ||
      this.activeView === 'summaryByDay'
    ) {
      if (!this.validateInstructorSelected()) {
        return;
      }

      this.loadInstructorDailySummary();
    }
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

    this.reportsService.getInstructorsMeetingsGroupedByHourCsv(
      this.filter.from,
      this.filter.to
    ).subscribe({
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


  handleInstructorDetailSummary(
    instructor: InstructorGroupedData,
  ): void {

    const firstName =
      instructor.user.firstName
        ?.trim()
        .toLowerCase();

    const lastName =
      instructor.user.lastName
        ?.trim()
        .toLowerCase();

    const selectedUser =
      this.instructors.find(user => {

        const userFirstName =
          user.firstName
            ?.trim()
            .toLowerCase();

        const userLastName =
          user.lastName
            ?.trim()
            .toLowerCase();

        return (
          userFirstName === firstName &&
          userLastName === lastName
        );
      });

    if (!selectedUser) {
      console.error(
        'No se encontró el instructor por nombre:',
        instructor.user.firstName,
        instructor.user.lastName,
      );

      return;
    }

    if (!selectedUser.instructor?.id) {
      console.error(
        'El usuario encontrado no tiene instructorId:',
        selectedUser,
      );

      return;
    }

    /* =========================
      SELECCIONAR INSTRUCTOR
    ========================= */

    this.selectInstructor(
      selectedUser,
    );

    /* =========================
      LIMPIAR VALIDACIONES
    ========================= */

    this.isNameFieldInvalid = false;
    this.showFromError = false;
    this.showToError = false;
    this.showDropdown = false;

    /* SELECCIONAR RESUMEN DIARIO */

    this.activeView = 'summary';

    /* CARGAR RESUMEN */

    this.loadInstructorDailySummary();

    // console.log(
    //   'INSTRUCTOR SELECCIONADO:',
    //   {
    //     name:
    //       this.filter.instructorName,
    //     instructorId:
    //       this.selectedInstructorId,
    //   }
    // );
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

  /* =========================
     NEW CHILD HELPERS
  ========================= */

  get currentDate(): string {
    return this.availableDates[
      this.currentDateIndex
    ] || '';
  }

  get currentInstructors(): InstructorGroupedData[] {
    if (!this.currentDate) {
      return [];
    }

    return (
      this.groupedMeetingsByDate[
        this.currentDate
      ] || []
    );
  }

  selectInstructorDetail(
    instructor: InstructorGroupedData,
  ): void {
    this.selectedInstructorDetail =
      instructor;
  }

  clearInstructorDetail(): void {
    this.selectedInstructorDetail =
      null;
  }
}