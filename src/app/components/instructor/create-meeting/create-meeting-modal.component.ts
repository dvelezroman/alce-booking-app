import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { DateTime } from 'luxon';

import { UserDto } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';
import { CreateMeetingDto } from '../../../services/dtos/booking.dto';
import { Mode, StudentClassification } from '../../../services/dtos/student.dto';

import {
  convertEcuadorDateToLocal,
  convertEcuadorHourToLocal,
  getTimezoneOffsetHours,
} from '../../../shared/utils/dates.util';

@Component({
  selector: 'app-create-meeting-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './create-meeting-modal.component.html',
  styleUrls: ['./create-meeting-modal.component.scss'],
})
export class CreateMeetingModalComponent implements OnInit {
  @Output() meetingCreated = new EventEmitter<CreateMeetingDto>();
  @Output() close = new EventEmitter<void>();

  @Input() instructorId?: number;

  searchTerm: string = '';
  filteredUsers: UserDto[] = [];
  selectedStudent?: UserDto;

  showUserDropdown: boolean = false;
  searchInput$ = new Subject<string>();

  showErrorToast: boolean = false;
  errorToastMessage: string = '';

  selectedMode: Mode = Mode.ONLINE;
  selectedHour: number | null = null;

  availableHours: number[] = [];

  constructor(
    private usersService: UsersService,
  ) {
    this.searchInput$
      .pipe(debounceTime(300))
      .subscribe((term: string) => {
        this.filterUsers(term);
      });
  }

  ngOnInit(): void {
    this.generateAvailableHours();
  }

  /* =========================
     FECHA
  ========================= */

  get today(): DateTime {
    return DateTime.now().setZone('America/Guayaquil');
  }

  get todayIsoDate(): string {
    return this.today.toFormat('yyyy-MM-dd');
  }

  get todayLabel(): string {
    const formatted = this.today
      .setLocale('es')
      .toFormat("cccc, dd 'de' LLLL 'de' yyyy");

    return this.capitalize(formatted);
  }

  get currentTimeLabel(): string {
    return this.today.toFormat('HH:mm');
  }

  /* =========================
     HORAS
  ========================= */

  private generateAvailableHours(): void {
    const startHour = 8;
    const endHour = 20;

    this.availableHours = Array.from(
      { length: endHour - startHour + 1 },
      (_, index) => startHour + index,
    ).filter(hour => this.isHourAvailable(hour));
  }

  private isHourAvailable(hour: number): boolean {
    const now = this.today;

    return hour >= now.hour;
  }

  selectHour(hour: number): void {
    if (!this.isHourAvailable(hour)) return;

    this.selectedHour = hour;
  }

  isHourSelected(hour: number): boolean {
    return this.selectedHour === hour;
  }

  formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;

    return `${normalizedHour.toString().padStart(2, '0')}:00 ${period}`;
  }

  /* =========================
     ESTUDIANTE
  ========================= */

  onSearchChange(term: string): void {
    this.searchInput$.next(term);
  }

  filterUsers(term: string): void {
    if (!term || term.trim().length < 2) {
      this.filteredUsers = [];
      this.showUserDropdown = false;
      return;
    }

    this.usersService
      .searchUsers(
        undefined,
        undefined,
        undefined,
        term,
        term,
        undefined,
      )
      .subscribe({
        next: result => {
          this.filteredUsers = result.users.filter(
            user => !!user.student,
          );

          this.showUserDropdown = true;
        },

        error: () => {
          this.filteredUsers = [];
          this.showUserDropdown = false;
        },
      });
  }

  selectUser(user: UserDto): void {
    if (!user.student) return;

    this.selectedStudent = user;
    this.searchTerm = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

    this.filteredUsers = [];
    this.showUserDropdown = false;
  }

  clearSelectedStudent(): void {
    this.selectedStudent = undefined;
    this.searchTerm = '';
    this.filteredUsers = [];
    this.showUserDropdown = false;
  }

  hideDropdown(): void {
    setTimeout(() => {
      this.showUserDropdown = false;
    }, 200);
  }

  get selectedStudentName(): string {
    if (!this.selectedStudent) return '';

    const firstName = this.selectedStudent.firstName ?? '';
    const lastName = this.selectedStudent.lastName ?? '';

    return `${firstName} ${lastName}`.trim();
  }

  get selectedStudentInitials(): string {
    if (!this.selectedStudent) return 'ES';

    const firstName = this.selectedStudent.firstName?.trim()?.charAt(0) ?? '';
    const lastName = this.selectedStudent.lastName?.trim()?.charAt(0) ?? '';

    return `${firstName}${lastName}`.toUpperCase() || 'ES';
  }

  get selectedStudentStage(): string {
    const stage = this.selectedStudent?.student?.stage;

    if (!stage) return 'Sin stage';

    return `Stage ${stage.number}${stage.description ? ` - ${stage.description}` : ''}`;
  }

  get selectedStudentCategory(): string {
    return (
      this.selectedStudent?.student?.studentClassification ??
      StudentClassification.ADULTS
    );
  }

  /* =========================
     MODALIDAD
  ========================= */

  selectMode(mode: Mode): void {
    this.selectedMode = mode;
  }

  get isOnlineSelected(): boolean {
    return this.selectedMode === Mode.ONLINE;
  }

  get isPresentialSelected(): boolean {
    return this.selectedMode === Mode.PRESENCIAL;
  }

  /* =========================
     VALIDACIONES
  ========================= */

  get canCreateMeeting(): boolean {
    return !!(
      this.selectedStudent?.student?.id &&
      this.instructorId &&
      this.selectedHour !== null &&
      this.selectedMode
    );
  }

  get validationMessage(): string | null {
    if (!this.selectedStudent) {
      return 'Selecciona un estudiante.';
    }

    if (this.selectedHour === null) {
      return 'Selecciona la hora de la clase.';
    }

    if (!this.instructorId) {
      return 'No se pudo identificar al instructor.';
    }

    return null;
  }

  /* =========================
     CREAR MEETING
  ========================= */

  createMeeting(): void {
    if (!this.canCreateMeeting) {
      this.showError(
        this.validationMessage ??
        'Faltan datos para crear la clase.',
      );

      return;
    }

    const student = this.selectedStudent!.student!;
    const selectedHour = this.selectedHour!;

    /*
     * La fecha siempre es HOY en Ecuador.
     * Ya no depende del filtro de la página.
     */
    const fromDate = this.todayIsoDate;

    const [year, month, day] = fromDate
      .split('-')
      .map(Number);

    const formattedMonth = month
      .toString()
      .padStart(2, '0');

    const formattedDay = day
      .toString()
      .padStart(2, '0');

    const formattedHour = selectedHour
      .toString()
      .padStart(2, '0');

    const formattedDate =
      `${year}-${formattedMonth}-${formattedDay}T${formattedHour}:00:00-05:00`;

    const date =
      getTimezoneOffsetHours() !== 0
        ? convertEcuadorDateToLocal(formattedDate)
        : formattedDate;

    const hour =
      getTimezoneOffsetHours() !== 0
        ? convertEcuadorHourToLocal(selectedHour)
        : selectedHour;

    const meeting: CreateMeetingDto = {
      studentId: student.id,
      instructorId: this.instructorId,
      stageId: student.stageId,
      date,
      hour,
      localdate: formattedDate,
      localhour: selectedHour,
      mode: this.selectedMode,
      category:
        student.studentClassification ??
        StudentClassification.ADULTS,
      createdByInstructor: true,
    };

    this.meetingCreated.emit(meeting);
  }

  /* =========================
     CLOSE
  ========================= */

  closeModal(): void {
    this.close.emit();
  }

  /* =========================
     ERROR
  ========================= */

  private showError(message: string): void {
    this.errorToastMessage = message;
    this.showErrorToast = true;

    setTimeout(() => {
      this.showErrorToast = false;
    }, 3000);
  }

  /* =========================
     TRACK BY
  ========================= */

  trackByUserId(
    index: number,
    user: UserDto,
  ): number {
    return user.id;
  }

  trackByHour(
    index: number,
    hour: number,
  ): number {
    return hour;
  }

  /* =========================
     HELPERS
  ========================= */

  private capitalize(value: string): string {
    if (!value) return '';

    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}