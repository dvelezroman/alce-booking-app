import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../services/booking.service';
import { MeetingDTO } from '../../../services/dtos/booking.dto';

@Component({
  selector: 'app-instructor-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instructor-calendar.component.html',
  styleUrls: ['./instructor-calendar.component.scss']
})
export class InstructorCalendarComponent implements OnInit {

  @Input() instructorId!: number;

  selectedMonth!: string;
  selectedYear!: number;
  minMonth!: string;
  minYear!: number;
  maxMonth!: string;
  maxYear!: number;

  currentMonthDays: { 
    day: number | string; 
    dayOfWeek: string; 
    hasMeeting: boolean; 
    meetings?: MeetingDTO[];
    isPast?: boolean;
  }[] = [];

  selectedDay: number | null = null;
  selectedDate: Date | null = null;
  meetingsOfDay: MeetingDTO[] = [];

  pendingClasses: MeetingDTO[] = [];
  groupedPending: { [date: string]: MeetingDTO[] } = {};
  datesSorted: string[] = []; 

  constructor(private bookingService: BookingService) {
    this.initializeCalendarSettings();
  }

  ngOnInit(): void {
    if (this.instructorId) {
      const today = new Date();
      this.generateCurrentMonthDays();
      this.getInstructorMeetings(today);
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

  getMonthIndex(monthName: string): number {
    const map: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };
    return map[monthName.toLowerCase()] ?? -1;
  }

  generateCurrentMonthDays(): void {
    const monthIndex = this.getMonthIndex(this.selectedMonth);
    if (monthIndex === -1) return;

    const daysInMonth = new Date(this.selectedYear, monthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(this.selectedYear, monthIndex, 1).getDay();

    this.currentMonthDays = Array.from({ length: firstDayOfWeek }, () => ({
      day: '', dayOfWeek: '', hasMeeting: false
    }));

    this.currentMonthDays = [
      ...this.currentMonthDays,
      ...Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(this.selectedYear, monthIndex, i + 1);
        return {
          day: i + 1,
          dayOfWeek: date.toLocaleString('es-ES', { weekday: 'long' }),
          hasMeeting: false
        };
      })
    ];
  }

  nextMonth(): void {
    const monthIndex = this.getMonthIndex(this.selectedMonth);
    const newDate = new Date(this.selectedYear, monthIndex + 1, 1);
    const maxDate = new Date(this.maxYear, this.getMonthIndex(this.maxMonth), 1);
    if (newDate > maxDate) return;

    this.selectedMonth = newDate.toLocaleString('es-ES', { month: 'long' });
    this.selectedYear = newDate.getFullYear();
    this.generateCurrentMonthDays();
    this.getInstructorMeetings(newDate);
  }

  prevMonth(): void {
    const monthIndex = this.getMonthIndex(this.selectedMonth);
    const newDate = new Date(this.selectedYear, monthIndex - 1, 1);
    const minDate = new Date(this.minYear, this.getMonthIndex(this.minMonth), 1);
    if (newDate < minDate) return;

    this.selectedMonth = newDate.toLocaleString('es-ES', { month: 'long' });
    this.selectedYear = newDate.getFullYear();
    this.generateCurrentMonthDays();
    this.getInstructorMeetings(newDate);
  }

  showMeetingsOfDay(day: any): void {
    if (typeof day.day !== 'number') return;
    this.selectedDay = day.day;
    this.selectedDate = new Date(this.selectedYear, this.getMonthIndex(this.selectedMonth), day.day);

    this.meetingsOfDay = day.meetings
      ? [...day.meetings].sort((a, b) => a.hour - b.hour)
      : [];
  }

  private getInstructorMeetings(date: Date): void {
    const monthIndex = this.getMonthIndex(this.selectedMonth);
    const year = this.selectedYear;

    this.bookingService.getInstructorMeetingsGroupedByHour({
      from: new Date(year, monthIndex, 1).toISOString(),
      to: new Date(year, monthIndex + 1, 0).toISOString(),
      instructorId: this.instructorId.toString()
    }).subscribe({
      next: meetings => {

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        this.pendingClasses = meetings
          .filter((m: MeetingDTO) => {
            const d = new Date(m.date);
            d.setHours(0, 0, 0, 0);
            return d >= now;
          })
          .sort((a: MeetingDTO, b: MeetingDTO) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        //console.log(this.pendingClasses);
        this.updatePendingGroups();

        const mapped = this.groupMeetingsByDay(meetings, monthIndex, year);
        this.updateMonthDaysWithMeetings(mapped);
      }
    });
  }

  private groupMeetingsByDay(meetings: MeetingDTO[], month: number, year: number) {
    const map = new Map<number, MeetingDTO[]>();

    meetings.forEach(m => {
      const meetingDate = new Date(m.date);
      const meetingMonth = meetingDate.getMonth();
      const meetingYear = meetingDate.getFullYear();

      if (meetingMonth === month && meetingYear === year) {
        const day = meetingDate.getDate();
        if (!map.has(day)) map.set(day, []);
        map.get(day)?.push(m);
      }
    });

    return map;
  }

  private updateMonthDaysWithMeetings(map: Map<number, MeetingDTO[]>) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.currentMonthDays = this.currentMonthDays.map(day => {
      if (typeof day.day !== 'number') {
        return { ...day, hasMeeting: false };
      }

      const meetingDate = new Date(this.selectedYear, this.getMonthIndex(this.selectedMonth), day.day);
      meetingDate.setHours(0, 0, 0, 0);

      const hasMeeting = map.has(day.day);
      const meetings = map.get(day.day) || [];
      const isPast = meetingDate < today;

      return {
        ...day,
        hasMeeting,
        meetings,
        isPast
      };
    });
  }

  /** AGRUPAR PENDIENTES POR FECHA */
    private updatePendingGroups(): void {
      this.groupedPending = {};
      
      this.pendingClasses.forEach((m: MeetingDTO) => {
        const dateKey = new Date(m.date).toISOString().split("T")[0];

        if (!this.groupedPending[dateKey]) {
          this.groupedPending[dateKey] = [];
        }

        this.groupedPending[dateKey].push(m);
      });

      this.datesSorted = Object.keys(this.groupedPending).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );

      //console.log(this.groupedPending);
    }

    formatGroupTitle(dateKey: string): string {
      const localDate = new Date(dateKey + 'T00:00:00');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      if (localDate.getTime() === today.getTime()) {
        return 'Hoy';
      }

      if (localDate.getTime() === tomorrow.getTime()) {
        return 'Mañana';
      }

      return localDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }

}