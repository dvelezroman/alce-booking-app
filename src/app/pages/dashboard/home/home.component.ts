import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { BookingService } from '../../../services/booking.service';
import { MeetingDTO } from '../../../services/dtos/booking.dto';
import { UserDto, UserRole } from '../../../services/dtos/user.dto';
import { StudyContentService } from '../../../services/study-content.service';
import { selectIsLoggedIn, selectUserData } from '../../../store/user.selector';
import { StudentInfoFormComponent } from '../../../components/student-info-form/student-info-form.component';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-home-private',
  standalone: true,
  imports: [
      CommonModule,
      RouterModule,
      FormsModule,
      ModalComponent,
      StudentInfoFormComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomePrivateComponent implements OnInit {
  modal: ModalDto = modalInitializer();
  isLoggedIn$: Observable<boolean>;
  isLoggedIn: boolean = false;
  userData$: Observable<UserDto | null>;
  isInstructor: boolean = false;
  isStudent: boolean  = false;
  instructorId: number | null = null;
  studyContentOptions: { id: string; name: string }[] = [];
  meetingStudyContents: number[] = [];

  selectedMonth!: string;
  selectedYear!: number;
  currentMonthDays: { day: number | string; dayOfWeek: string; hasMeeting: boolean }[] = [];
  selectedDay: number | null = null;
  maxMonth!: string;
  maxYear!: number;
  minMonth!: string;
  minYear!: number;

  selectedDate: Date | null = null;
  meetingsOfDay: MeetingDTO[] = [];

  selectedMeeting: any;
  meetingContent: string = '';
  isUpdating: boolean = false;
  showStudentInfoForm = false;

  constructor(private store: Store,
              private bookingService: BookingService,
              private studyContentService: StudyContentService,
              private usersService: UsersService,
  ) {
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
    this.userData$ = this.store.select(selectUserData);
    this.initializeCalendarSettings();
  }

  ngOnInit() {
    this.isLoggedIn$.subscribe(state => {
      this.isLoggedIn = state;
    });

    this.checkUserRoleAndFormVisibility();

    this.store.select(selectUserData).subscribe((userData: UserDto | null) => {
      if (userData && userData.instructor) {
        this.instructorId = userData.instructor.id;
         const today = new Date();
         this.getInstructorMeetings(today);
      } else {
      }
    });

    this.userData$.subscribe(user => {
      this.isInstructor = user?.role === UserRole.INSTRUCTOR;
      this.isStudent    = user?.role === UserRole.STUDENT;
      if (this.isInstructor) {
        this.generateCurrentMonthDays();
      }
    });
  }

  private checkUserRoleAndFormVisibility(): void {
    this.userData$.subscribe(user => {
      this.isInstructor = user?.role === UserRole.INSTRUCTOR;
      this.isStudent = user?.role === UserRole.STUDENT;

      if (this.isStudent && user?.dataCompleted === false) {
        this.showStudentInfoForm = true;
      }

      if (this.isInstructor) {
        this.generateCurrentMonthDays();
      }
    });
  }

  get studyContentNames(): string {
    if (this.studyContentOptions.length === 0) return 'Sin contenidos asignados';
    return this.studyContentOptions.map(c => c.name).join('\n');
  }

  private loadStudyContentNames(contentIds: number[]) {
    this.studyContentOptions = [];

    if (contentIds.length > 0) {
      this.studyContentService.getManyStudyContents(contentIds).subscribe(result => {
        this.studyContentOptions = result.map(r => ({
          id: r.stage.number,
          name: `Unidad ${r.unit}: ${r.title}`
        }))
      })
    }
  }

  private initializeCalendarSettings(): void {
    const today = new Date();
    this.selectedMonth = today.toLocaleString('es-ES', { month: 'long' });
    this.selectedYear = today.getFullYear();
    this.minMonth = this.selectedMonth;
    this.minYear = this.selectedYear;

    const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    this.maxMonth = nextMonthDate.toLocaleString('es-ES', { month: 'long' });
    this.maxYear = nextMonthDate.getFullYear();
  }

  generateCurrentMonthDays() {
    const monthMap: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };

    const monthIndex = monthMap[this.selectedMonth.toLowerCase()];
    if (monthIndex === undefined) {
      console.error('Mes inválido:', this.selectedMonth);
      return;
    }

    const daysInMonth = new Date(this.selectedYear, monthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(this.selectedYear, monthIndex, 1).getDay();

    this.currentMonthDays = Array.from({ length: firstDayOfWeek }, () => ({
      day: '',
      dayOfWeek: '',
      hasMeeting: false
    }));

    // Días del mes actual
    this.currentMonthDays = this.currentMonthDays.concat(
      Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(this.selectedYear, monthIndex, i + 1);
        return {
          day: i + 1,
          dayOfWeek: date.toLocaleString('es-ES', { weekday: 'long' }),
          hasMeeting: false
        };
      })
    );
  }

  nextMonth() {
    const monthMap: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };

    const currentMonthIndex = monthMap[this.selectedMonth.toLowerCase()];
    if (currentMonthIndex === undefined) {
      return;
    }

    const newDate = new Date(this.selectedYear, currentMonthIndex + 1, 1);
    const maxDate = new Date(this.maxYear, monthMap[this.maxMonth.toLowerCase()], 1);
    if (newDate > maxDate) return;

    this.selectedMonth = newDate.toLocaleString('es-ES', { month: 'long' });
    this.selectedYear = newDate.getFullYear();
    this.selectedDay = null;
    this.generateCurrentMonthDays();
    this.getInstructorMeetings(newDate);
  }

  prevMonth() {
    const monthMap: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };

    const currentMonthIndex = monthMap[this.selectedMonth.toLowerCase()];
    if (currentMonthIndex === undefined) {
      return;
    }

    const newDate = new Date(this.selectedYear, currentMonthIndex - 1, 1);
    const minDate = new Date(this.minYear, monthMap[this.minMonth.toLowerCase()], 1);
    if (newDate < minDate) return;

    this.selectedMonth = newDate.toLocaleString('es-ES', { month: 'long' });
    this.selectedYear = newDate.getFullYear();
    this.selectedDay = null;
    this.generateCurrentMonthDays();
    this.getInstructorMeetings(newDate);
  }

  isDaySelectable(day: { day: number | string, isNextMonth?: boolean }): boolean {
    if (typeof day.day !== 'number') return false;

    const today = new Date();
    const currentMonthIndex = this.getMonthIndex(this.selectedMonth);
    const selectedDate = new Date(this.selectedYear, currentMonthIndex, +day.day);
    const esHoyOMasTarde = selectedDate >= new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const esDomingo = selectedDate.getDay() === 0;

    return esHoyOMasTarde && !esDomingo;
  }

  selectDay(day: { day: number | string, isNextMonth: boolean }) {
    if (typeof day.day === 'number') {
      this.selectedDay = day.day;
      if (day.isNextMonth) {
        this.nextMonth();
        this.selectedDay = day.day;
      }
    }
  }

  showMeetingsOfDay(day: { day: number | string; dayOfWeek: string; hasMeeting: boolean; meetings?: MeetingDTO[] }) {
    if (typeof day.day === 'number') {
      this.selectedDay = day.day;
      this.selectedDate = new Date(this.selectedYear, this.getMonthIndex(this.selectedMonth), day.day);

      if (day.hasMeeting && day.meetings && day.meetings.length > 0) {
        this.meetingsOfDay = [...day.meetings].sort((a, b) => a.hour - b.hour);
      } else {
        this.meetingsOfDay = [];
      }
    } else {
      console.log('Día no válido:', day);
    }
  }

  getMonthIndex(monthName: string): number {
    const monthMap: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };

    return monthMap[monthName.toLowerCase()] ?? -1;
  }

  getInstructorMeetings(selectedDate: Date) {
    const { month, year } = this.extractMonthAndYear(selectedDate);
    this.bookingService.getInstructorMeetingsGroupedByHour({
      from: this.getMonthStartDate(year, month),
      to: this.getMonthEndDate(year, month),
      instructorId: this.instructorId?.toString(),
    }).subscribe({
      next: (meetings) => this.handleMeetingsResponse(meetings, month, year),
      error: (error) => console.error('Error al obtener reuniones:', error),
    });
  }

  private extractMonthAndYear(date: Date) {
    return { month: date.getMonth(), year: date.getFullYear() };
  }

  private getMonthStartDate(year: number, month: number): string {
    return new Date(year, month, 1).toISOString();
  }

  private getMonthEndDate(year: number, month: number): string {
    return new Date(year, month + 1, 0).toISOString();
  }

  private handleMeetingsResponse(meetings: MeetingDTO[], month: number, year: number) {
    const daysWithMeetings = this.groupMeetingsByDay(meetings, month, year);
    //console.log(daysWithMeetings);
    this.updateMonthDaysWithMeetings(daysWithMeetings);
  }

  private groupMeetingsByDay(meetings: MeetingDTO[], month: number, year: number): Map<number, MeetingDTO[]> {
    const daysMap = new Map<number, MeetingDTO[]>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    meetings.forEach((meeting) => {
      const meetingDate = new Date(meeting.date);
      meetingDate.setHours(0, 0, 0, 0);

      //Filtrar reuniones en el pasado
      if (meetingDate < today) {
        return;
      }

      if (meetingDate.getMonth() === month && meetingDate.getFullYear() === year) {
        const day = meetingDate.getDate();
        if (!daysMap.has(day)) daysMap.set(day, []);
        daysMap.get(day)?.push(meeting);
      }
    });

    return daysMap;
  }

  private updateMonthDaysWithMeetings(daysWithMeetings: Map<number, MeetingDTO[]>) {
    this.currentMonthDays = this.currentMonthDays.map(day => ({
      ...day,
      hasMeeting: daysWithMeetings.has(day.day as number),
      meetings: daysWithMeetings.get(day.day as number) || []
    }));
  }

  handleStudentInfoSubmit(data: { email: string; contact: string; city: string; country: string }) {
    this.userData$.subscribe(user => {
      if (!user?.id) {
        this.showModal(this.createModalParams(true, 'No se pudo obtener el ID del usuario.'));
        return;
      }

      const payload = {
        emailAddress: data.email,
        contact: data.contact,
        city: data.city,
        country: data.country,
      };
      //console.log('Payload enviado:', payload);
      this.usersService.update(user.id, payload).subscribe({
        next: () => {
          this.showStudentInfoForm = false;
          this.usersService.refreshLogin().subscribe();
          this.showModal(this.createModalParams(false, 'Información actualizada con éxito.'));
        },
        error: () => {
          this.showModal(this.createModalParams(true, 'Ocurrió un error al actualizar la información.'));
        }
      });
    });
  }

  showModal(params: ModalDto) {
    this.modal = { ...params };
    setTimeout(() => {
      this.modal.close();
    }, 2500);
  }

  closeModal = () => {
    this.modal = { ...modalInitializer() };
  }

  createModalParams(isError: boolean, message: string): ModalDto {
    return {
      ...this.modal,
      show: true,
      isError,
      isSuccess: !isError,
      message,
      close: this.closeModal
    };
  }


}
