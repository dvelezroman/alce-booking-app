import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DateTime } from 'luxon';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { BookingService } from '../../../services/booking.service';
import { MeetingDTO } from '../../../services/dtos/booking.dto';
import { UserDto } from '../../../services/dtos/user.dto';
import { StudyContentService } from '../../../services/study-content.service';
import { selectIsLoggedIn, selectUserData } from '../../../store/user.selector';

@Component({
  selector: 'app-meetings-student',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ModalComponent
  ],
  templateUrl: './meetings-student.component.html',
  styleUrl: './meetings-student.component.scss'
})
export class MeetingsStudentComponent implements OnInit {
  isLoggedIn$: Observable<boolean>;
  userData$: Observable<UserDto | null>;
  isLoggedIn: boolean = false;
  studentId: number | null = null;
  selectedMonth!: string;
  selectedYear!: number;
  currentMonthDays: { day: number | string; dayOfWeek: string; hasMeeting: boolean; meetings?: MeetingDTO[]; isPast?: boolean; }[] = [];
  selectedDay: number | null = null;
  maxMonth!: string;
  maxYear!: number;
  minMonth!: string;
  minYear!: number;
  viewMode: 'calendar' | 'range' = 'calendar';
  rangeError = { from: false, to: false };
  rangeFrom: string = '';
  rangeTo: string = '';
  selectedDate: Date | null = null;
  meetingsOfDay: MeetingDTO[] = [];
  showEcuadorHourColumn = false;
  studyContentOptions: { id: number; name: string }[] = [];
  modal: ModalDto = modalInitializer();

  constructor(
    private store: Store,
    private bookingService: BookingService,
    private studyContentService: StudyContentService
  ) {
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
    this.userData$ = this.store.select(selectUserData);
    this.initializeCalendarSettings();
  }

  ngOnInit() {
    this.isLoggedIn$.subscribe(state => this.isLoggedIn = state);

    this.userData$.subscribe(user => {
      if (user && user.student) {
        this.studentId = user.student.id;
        this.generateCurrentMonthDays();
        const today = new Date();
        this.getStudentMeetings(today);
      }
    });

    this.studyContentService.getAll().subscribe(contents => {
      this.studyContentOptions = contents.map(c => ({
        id: c.id,
        name: `Unidad ${c.unit}: ${c.title}`
      }));
      console.log('contenidos:', this.studyContentOptions);
    });
  }

  setViewMode(mode: 'calendar' | 'range') {
    this.viewMode = mode;
    this.meetingsOfDay = [];
    this.selectedDay = null;
    this.selectedDate = null;

    if (mode === 'calendar') {
      this.rangeFrom = '';
      this.rangeTo = '';
      this.rangeError = { from: false, to: false };
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
    if (monthIndex === undefined) return;

    const daysInMonth = new Date(this.selectedYear, monthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(this.selectedYear, monthIndex, 1).getDay();

    this.currentMonthDays = Array.from({ length: firstDayOfWeek }, () => ({ day: '', dayOfWeek: '', hasMeeting: false }));

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
    const current = new Date(this.selectedYear, this.getMonthIndex(this.selectedMonth));
    const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    if (next > new Date(this.maxYear, this.getMonthIndex(this.maxMonth))) return;

    this.selectedMonth = next.toLocaleString('es-ES', { month: 'long' });
    this.selectedYear = next.getFullYear();
    this.selectedDay = null;
    this.generateCurrentMonthDays();
    this.getStudentMeetings(next);
  }

  prevMonth() {
    const current = new Date(this.selectedYear, this.getMonthIndex(this.selectedMonth));
    const prev = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    if (prev < new Date(this.minYear, this.getMonthIndex(this.minMonth))) return;

    this.selectedMonth = prev.toLocaleString('es-ES', { month: 'long' });
    this.selectedYear = prev.getFullYear();
    this.selectedDay = null;
    this.generateCurrentMonthDays();
    this.getStudentMeetings(prev);
  }

  getMonthIndex(monthName: string): number {
    const monthMap: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };
    return monthMap[monthName.toLowerCase()] ?? -1;
  }

  showMeetingsOfDay(day: { day: number | string; dayOfWeek: string; hasMeeting: boolean; meetings?: MeetingDTO[] }) {
    if (typeof day.day === 'number') {
      this.selectedDay = day.day;
      this.selectedDate = new Date(this.selectedYear, this.getMonthIndex(this.selectedMonth), day.day);
      this.meetingsOfDay = day.meetings ?? [];
      this.showEcuadorHourColumn = this.meetingsOfDay.some(
        (meeting) => meeting.date !== meeting.localdate
      );
    }
  }

  searchMeetingsByRange() {
    this.rangeError = { from: false, to: false };

    if (!this.rangeFrom || !this.rangeTo) {
      if (!this.rangeFrom) this.rangeError.from = true;
      if (!this.rangeTo) this.rangeError.to = true;
      return;
    }

    if (!this.studentId) return;

    this.bookingService.searchMeetings({
      from: this.rangeFrom,
      to: this.rangeTo,
      studentId: this.studentId,
      assigned: true,
      // status: MeetingStatusEnum.ACTIVE
    }).subscribe({
      next: (meetings) => {
        this.selectedDay = null;
        this.selectedDate = null;
        this.meetingsOfDay = meetings;
        this.showEcuadorHourColumn = meetings.some(m => m.date !== m.localdate);
      },
      error: (err) => console.error('Error en búsqueda por rango:', err)
    });
  }

  getStudentMeetings(selectedDate: Date) {
    const now = DateTime.now().setZone('America/Guayaquil').startOf('day');
    const until = now.plus({ days: 20 });

    this.bookingService.searchMeetings({
      from: now.toISODate()!,
      to: until.toISODate()!,
      studentId: this.studentId ?? undefined,
      assigned: true,
    }).subscribe({
      next: (meetings) => {
        const daysWithMeetings = this.groupMeetingsByDay(meetings, selectedDate, now, until);
        this.updateCalendarWithMeetings(daysWithMeetings);
      },
      error: (error) => console.error('Error al obtener reuniones del estudiante:', error)
    });
  }

  private groupMeetingsByDay(meetings: MeetingDTO[], selectedDate: Date, start: DateTime, end: DateTime): Map<number, MeetingDTO[]> {
    const map = new Map<number, MeetingDTO[]>();

    meetings.forEach((meeting: MeetingDTO) => {
      const rawDate = typeof meeting.date === 'string' ? meeting.date : meeting.date.toISOString();
      const meetingDate = DateTime.fromISO(rawDate, { zone: 'America/Guayaquil' }).startOf('day');

      if (meetingDate >= start && meetingDate <= end) {
        const day = meetingDate.day;
        const month = meetingDate.month - 1;
        const year = meetingDate.year;

        if (month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
          if (!map.has(day)) map.set(day, []);
          map.get(day)?.push(meeting);
        }
      }
    });

    return map;
  }

  private updateCalendarWithMeetings(daysWithMeetings: Map<number, MeetingDTO[]>) {
    this.currentMonthDays = this.currentMonthDays.map(day => {
      if (typeof day.day === 'number' && daysWithMeetings.has(day.day)) {
        return {
          ...day,
          hasMeeting: true,
          meetings: daysWithMeetings.get(day.day) || [],
          isPast: false
        };
    }

    return {
      ...day,
      hasMeeting: false,
      meetings: [],
      isPast: false
    };
  });
}

  getStudyContentList(meeting: MeetingDTO): string {
    if (!meeting.studyContent || meeting.studyContent.length === 0) {
      return 'Sin contenido';
    }
    const names = meeting.studyContent.map(c => `Unidad ${c.unit}: ${c.title}`).join('\n');
    return names;
  }

  getFormattedSelectedDate(): string {
    if (!this.selectedDate) return '';
    return DateTime.fromJSDate(this.selectedDate)
      .setLocale('es')
      .toFormat("cccc, d 'de' LLLL");
  }

  getUtcFormattedDate(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleDateString('es-EC', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    });
  }

  get24HourFormat(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });
  }

  getMeetingThemeDescription(theme?: { description: string } | null): string {
    return theme?.description ?? 'Sin contenido';
}

  isPastMeeting(date: string | Date | null | undefined): boolean {
    if (!date) return false;
    const now = DateTime.now().setZone('utc').startOf('day');
    const meetingDate = typeof date === 'string'
      ? DateTime.fromISO(date, { zone: 'utc' }).startOf('day')
      : DateTime.fromJSDate(date).startOf('day');
    return meetingDate < now;
  }

  getAssistanceText(item: MeetingDTO): string {
    const now = DateTime.now().setZone('America/Guayaquil');
    const meetingDate = DateTime.fromISO(item.localdate.toString(), { zone: 'America/Guayaquil' });
  
    if (meetingDate > now) {
      return '-';
    }
    if (item.present === false) {
    return 'No asistió';
    }
    return 'Asistió';
  }

  showContentModal(content: string) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: content,
      isContentViewer: true,
      close: this.closeModal
    };
  }

  closeModal = () => {
    this.modal = { ...modalInitializer() };
  };
}
