import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthKey } from '../../services/dtos/meeting-theme.dto';
import { DateTime } from 'luxon';
import { DisabledDatesAndHours } from '../../services/dtos/handle-date.dto';

@Component({
  selector: 'app-meeting-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meeting-calendar.component.html',
  styleUrl: './meeting-calendar.component.scss'
})
export class MeetingCalendarComponent implements OnInit {
  @Input() isScheduleEnabled: boolean = true;
  @Input() disabledDates: Record<string, number[]> = {};
  @Input() disabledDatesAndHours: DisabledDatesAndHours = {};
  @Input() resetSelectionTrigger: boolean = false;

  @Output() daySelected = new EventEmitter<{ date: string; label: string; day: number }>();

  currentMonthDays: any[] = [];
  selectedMonth!: string;
  selectedYear!: number;
  selectedDay: number | null = null;
  selectedDayFormatted: string = '';
  calendarAnimationClass: string = '';
  canGoBack: boolean = false;
  canGoForward: boolean = true;

  ecuadorDate: string = DateTime.now().setZone('America/Guayaquil').setLocale('es').toFormat("EEEE, dd 'de' LLLL");

  ngOnInit(): void {
    this.initializeCalendar();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resetSelectionTrigger'] && changes['resetSelectionTrigger'].currentValue) {
      this.resetCalendarSelection();
    }
    if (changes['disabledDates'] || changes['disabledDatesAndHours']) {
      this.generateCurrentMonthDays();
    }
  }

  private resetCalendarSelection(): void {
    this.selectedDay = null;
    this.selectedDayFormatted = '';
  }

  initializeCalendar(): void {
    const today = new Date();
    this.selectedMonth = today.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    this.selectedYear = today.getFullYear();

    this.generateCurrentMonthDays();
    this.updateNavigationButtons();
  }

  updateNavigationButtons(): void {
    const today = new Date();
    const currentMonth = today.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    const currentYear = today.getFullYear();
    const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const nextMonth = nextMonthDate.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    const nextYear = nextMonthDate.getFullYear();

    this.canGoBack = !(this.selectedMonth === currentMonth && this.selectedYear === currentYear);
    this.canGoForward = !(this.selectedMonth === nextMonth && this.selectedYear === nextYear);
  }

  prevMonth(): void {
    this.changeMonth(-1);
  }

  nextMonth(): void {
    this.changeMonth(1);
  }

  private changeMonth(offset: number): void {
    const monthMap: Record<MonthKey, number> = {
      ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
      JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11
    };
    const currentMonthIndex = monthMap[this.selectedMonth as MonthKey];
    const currentDate = new Date(this.selectedYear, currentMonthIndex, 1);
    currentDate.setMonth(currentDate.getMonth() + offset);

    this.selectedMonth = currentDate.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    this.selectedYear = currentDate.getFullYear();

    this.selectedDay = null;
    this.selectedDayFormatted = '';

    this.generateCurrentMonthDays();
    this.updateNavigationButtons();
  }

  generateCurrentMonthDays(): void {
    const monthMap: Record<MonthKey, number> = {
        ENERO: 1, FEBRERO: 2, MARZO: 3, ABRIL: 4, MAYO: 5, JUNIO: 6,
        JULIO: 7, AGOSTO: 8, SEPTIEMBRE: 9, OCTUBRE: 10, NOVIEMBRE: 11, DICIEMBRE: 12
    };

    const monthIndex = monthMap[this.selectedMonth as MonthKey];
    const startOfMonth = DateTime.fromObject({ year: this.selectedYear, month: monthIndex, day: 1 }, { zone: 'America/Guayaquil' });
    const daysInMonth = startOfMonth.daysInMonth;
    

    if (!daysInMonth) {
        console.error('No se pudo obtener la cantidad de días del mes.');
        this.currentMonthDays = [];
        return;
    }

    const firstDayOfWeek = startOfMonth.weekday % 7;

    this.currentMonthDays = Array.from({ length: firstDayOfWeek }, () => ({ day: '', isDisabled: false }));
    this.currentMonthDays = this.currentMonthDays.concat(
        Array.from({ length: daysInMonth }, (_, i) => {
        const date = startOfMonth.plus({ days: i });
        const isDisabled = this.isDayDisabled(date.day, monthIndex - 1);
        
        return {
            day: date.day,
            dayOfWeek: date.setLocale('es').toFormat('cccc').toUpperCase(),
            date: date.toFormat('yyyy-MM-dd'),
            isDisabled,
        };
        })
    );
  }

  isDaySelectable(day: { day: number | null; isDisabled?: boolean }): boolean {
    if (!day.day || isNaN(day.day) || day.isDisabled) return false;

    const monthMap: Record<string, number> = {
        ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
        JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11
    };

    if (!this.selectedMonth || !this.selectedYear || !(this.selectedMonth in monthMap)) {
        return false;
    }

    const monthIndex = monthMap[this.selectedMonth];

    const selectedDate = DateTime.fromObject(
        { year: this.selectedYear, month: monthIndex + 1, day: day.day },
        { zone: 'America/Guayaquil' }
    ).startOf('day');

    const today = DateTime.now().setZone('America/Guayaquil').startOf('day');

    const weekday = today.weekday;
    const weekStart = today.minus({ days: weekday - 1 });
    const weekEnd = weekStart.plus({ days: 5 });
    const nextWeekStart = weekStart.plus({ days: 7 });
    const nextWeekEnd = nextWeekStart.plus({ days: 5 });

    return (
        selectedDate.weekday !== 7 &&
        selectedDate >= today &&
        (
        (selectedDate >= weekStart && selectedDate <= weekEnd) ||
        (selectedDate >= nextWeekStart && selectedDate <= nextWeekEnd)
        )
    );
  }

isDayDisabled(day: number, monthIndex: number): boolean {
  const monthKey = monthIndex.toString();
  const disabledDays = this.disabledDates[monthKey] || [];

  const dayData = this.disabledDatesAndHours[monthKey]?.find(d => d.day === day);
  const uniqueHours = dayData?.hours ? Array.from(new Set(dayData.hours)) : [];

  if (!this.selectedYear || isNaN(this.selectedYear)) {
    return false; 
  }

  const date = DateTime.fromObject(
    { year: this.selectedYear, month: monthIndex + 1, day },
    { zone: 'America/Guayaquil' }
  );

  const isSaturday = date.weekday === 6;
  const totalHoursAvailable = isSaturday ? 6 : 13;

  const isAllHoursBlocked = uniqueHours.length >= totalHoursAvailable;
  const isFullyDisabled = disabledDays.includes(day) && uniqueHours.length === 0;

  return isFullyDisabled || isAllHoursBlocked;
}

  onDayClick(day: any): void {
    if (!day.day || day.isDisabled) return;
    if (!this.isScheduleEnabled) return;

    const selectedDate = `${this.selectedYear}-${this.padNumber(this.getMonthIndex(this.selectedMonth) + 1)}-${this.padNumber(day.day)}`;
    this.selectedDay = day.day;
    this.selectedDayFormatted = `${day.dayOfWeek}, ${this.selectedMonth} ${day.day}`;

    this.daySelected.emit({
        date: selectedDate,
        label: this.selectedDayFormatted,
        day: day.day 
        });
  }

  private getMonthIndex(monthName: string): number {
    const monthMap: Record<MonthKey, number> = {
    ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
    JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11
    };
    return monthMap[monthName as MonthKey];
  }

  private padNumber(n: number): string {
    return n.toString().padStart(2, '0');
  }
}