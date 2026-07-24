import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';

import { MonthKey } from '../../../services/dtos/meeting-theme.dto';
import { DisabledDatesAndHours } from '../../../services/dtos/handle-date.dto';

interface BookingCalendarDay {
  day: number | '';
  dayOfWeek?: string;
  date?: string;
  isDisabled: boolean;
  hasDisabledHours?: boolean;
  restrictedMode?: string | null;
}

@Component({
  selector: 'app-booking-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-calendar.component.html',
  styleUrl: './booking-calendar.component.scss',
})
export class BookingCalendarComponent implements OnInit, OnChanges {
  @Input() isScheduleEnabled = true;
  @Input() disabledDates: Record<string, any[]> = {};
  @Input() disabledDatesAndHours: DisabledDatesAndHours = {};
  @Input() resetSelectionTrigger = false;
  @Input() userCity: string | null = null;
  @Input() userMode: string | null = null;
  @Input() userClassification: string | null = null;

  @Output() daySelected = new EventEmitter<{
    date: string;
    label: string;
    day: number;
  }>();

  @Output() monthChanged = new EventEmitter<{
    year: number;
    month: number;
  }>();

  currentMonthDays: BookingCalendarDay[] = [];
  selectedMonth = '';
  selectedYear = 0;
  selectedDay: number | null = null;
  selectedDayFormatted = '';
  calendarAnimationClass = '';

  canGoBack = false;
  canGoForward = true;

  ngOnInit(): void {
    this.initializeCalendar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['resetSelectionTrigger'] &&
      changes['resetSelectionTrigger'].currentValue
    ) {
      this.resetCalendarSelection();
    }

    const availabilityChanged =
      changes['disabledDates'] ||
      changes['disabledDatesAndHours'] ||
      changes['userCity'] ||
      changes['userMode'] ||
      changes['userClassification'];

    if (
      availabilityChanged &&
      this.selectedMonth &&
      this.selectedYear
    ) {
      this.generateCurrentMonthDays();
    }
  }

  initializeCalendar(): void {
    const today = DateTime.now()
      .setZone('America/Guayaquil')
      .setLocale('es');

    this.selectedMonth = today
      .toFormat('LLLL')
      .toUpperCase();

    this.selectedYear = today.year;

    this.generateCurrentMonthDays();
    this.updateNavigationButtons();
  }

  prevMonth(): void {
    if (!this.canGoBack) {
      return;
    }

    this.changeMonth(-1);
  }

  nextMonth(): void {
    if (!this.canGoForward) {
      return;
    }

    this.changeMonth(1);
  }

  isDaySelectable(day: BookingCalendarDay): boolean {
    if (
      !day.day ||
      typeof day.day !== 'number' ||
      Number.isNaN(day.day) ||
      day.isDisabled
    ) {
      return false;
    }

    const monthIndex = this.getMonthIndex(this.selectedMonth);

    if (
      monthIndex < 0 ||
      !this.selectedYear
    ) {
      return false;
    }

    const selectedDate = DateTime.fromObject(
      {
        year: this.selectedYear,
        month: monthIndex + 1,
        day: day.day,
      },
      {
        zone: 'America/Guayaquil',
      }
    ).startOf('day');

    const today = DateTime.now()
      .setZone('America/Guayaquil')
      .startOf('day');

    const weekStart = today.minus({
      days: today.weekday - 1,
    });

    const weekEnd = weekStart.plus({
      days: 5,
    });

    const nextWeekStart = weekStart.plus({
      days: 7,
    });

    const nextWeekEnd = nextWeekStart.plus({
      days: 5,
    });

    return (
      selectedDate.weekday !== 7 &&
      selectedDate >= today &&
      (
        (
          selectedDate >= weekStart &&
          selectedDate <= weekEnd
        ) ||
        (
          selectedDate >= nextWeekStart &&
          selectedDate <= nextWeekEnd
        )
      )
    );
  }

  onDayClick(day: BookingCalendarDay): void {
    if (
      !day.day ||
      typeof day.day !== 'number' ||
      day.isDisabled ||
      !this.isScheduleEnabled
    ) {
      return;
    }

    if (!this.isDaySelectable(day)) {
      return;
    }

    const selectedDate = [
      this.selectedYear,
      this.padNumber(
        this.getMonthIndex(this.selectedMonth) + 1
      ),
      this.padNumber(day.day),
    ].join('-');

    this.selectedDay = day.day;

    this.selectedDayFormatted =
      `${day.dayOfWeek}, ${this.selectedMonth} ${day.day}`;

    this.daySelected.emit({
      date: selectedDate,
      label: this.selectedDayFormatted,
      day: day.day,
    });
  }

  isDayDisabled(
    day: number,
    monthIndex: number
  ): boolean {
    if (!this.selectedYear) {
      return false;
    }

    const monthKey = String(monthIndex);

    const dayRules =
      this.disabledDates?.[monthKey] ?? [];

    const hourRules =
      this.disabledDatesAndHours?.[monthKey] ?? [];

    const userCity = this.normalizeValue(
      this.userCity
    );

    const userClass = this.normalizeValue(
      this.userClassification
    );

    const matchingDayRules = dayRules.filter(
      (rule: any) => {
        if (!rule) {
          return false;
        }

        if (Number(rule.day) !== Number(day)) {
          return false;
        }

        const cityOk =
          rule.city === null ||
          this.normalizeValue(rule.city) === userCity;

        const classOk =
          rule.studentClassification === null ||
          this.normalizeValue(
            rule.studentClassification
          ) === userClass;

        return cityOk && classOk;
      }
    );

    const hasBlockedHours = hourRules.some(
      (rule: any) => {
        if (!rule) {
          return false;
        }

        if (Number(rule.day) !== Number(day)) {
          return false;
        }

        const cityOk =
          rule.city === null ||
          this.normalizeValue(rule.city) === userCity;

        const classOk =
          rule.studentClassification === null ||
          this.normalizeValue(
            rule.studentClassification
          ) === userClass;

        return (
          cityOk &&
          classOk &&
          Array.isArray(rule.hours) &&
          rule.hours.length > 0
        );
      }
    );

    // Si existen horas bloqueadas, el día completo
    // debe continuar disponible.
    if (hasBlockedHours) {
      return false;
    }

    if (matchingDayRules.length === 0) {
      return false;
    }

    // Una regla con modalidad solo limita una modalidad,
    // pero no bloquea el día completo.
    const hasModeRestriction =
      matchingDayRules.some(
        (rule: any) =>
          rule.mode !== null &&
          rule.mode !== undefined
      );

    if (hasModeRestriction) {
      return false;
    }

    return true;
  }

  getRestrictedMode(
    day: number,
    monthIndex: number
  ): string | null {
    const monthKey = String(monthIndex);

    const rules =
      this.disabledDates?.[monthKey] ?? [];

    const userCity = this.normalizeValue(
      this.userCity
    );

    const userClass = this.normalizeValue(
      this.userClassification
    );

    const matchingRule = rules.find(
      (rule: any) => {
        if (!rule) {
          return false;
        }

        if (Number(rule.day) !== Number(day)) {
          return false;
        }

        const cityOk =
          rule.city === null ||
          this.normalizeValue(rule.city) === userCity;

        const classOk =
          rule.studentClassification === null ||
          this.normalizeValue(
            rule.studentClassification
          ) === userClass;

        return (
          cityOk &&
          classOk &&
          rule.mode !== null &&
          rule.mode !== undefined
        );
      }
    );

    return matchingRule?.mode ?? null;
  }

  hasModeRestriction(
    day: number,
    monthIndex: number
  ): boolean {
    return this.getRestrictedMode(
      day,
      monthIndex
    ) !== null;
  }

  private resetCalendarSelection(): void {
    this.selectedDay = null;
    this.selectedDayFormatted = '';
  }

  private changeMonth(offset: number): void {
    const currentMonthIndex =
      this.getMonthIndex(this.selectedMonth);

    if (currentMonthIndex < 0) {
      return;
    }

    const currentDate = DateTime.fromObject(
      {
        year: this.selectedYear,
        month: currentMonthIndex + 1,
        day: 1,
      },
      {
        zone: 'America/Guayaquil',
        locale: 'es',
      }
    ).plus({
      months: offset,
    });

    this.selectedMonth = currentDate
      .toFormat('LLLL')
      .toUpperCase();

    this.selectedYear = currentDate.year;

    this.resetCalendarSelection();

    this.generateCurrentMonthDays();
    this.updateNavigationButtons();

    this.monthChanged.emit({
      year: this.selectedYear,
      month: currentDate.month,
    });
  }

  private generateCurrentMonthDays(): void {
    if (
      !this.selectedMonth ||
      !this.selectedYear
    ) {
      this.currentMonthDays = [];
      return;
    }

    const monthIndex =
      this.getMonthIndex(this.selectedMonth);

    if (monthIndex < 0) {
      this.currentMonthDays = [];
      return;
    }

    const startOfMonth = DateTime.fromObject(
      {
        year: this.selectedYear,
        month: monthIndex + 1,
        day: 1,
      },
      {
        zone: 'America/Guayaquil',
        locale: 'es',
      }
    );

    const daysInMonth = startOfMonth.daysInMonth;

    if (!daysInMonth) {
      this.currentMonthDays = [];
      return;
    }

    // Luxon usa lunes = 1 y domingo = 7.
    // Con el encabezado empezando en domingo,
    // domingo debe ocupar la posición 0.
    const firstDayOffset =
      startOfMonth.weekday % 7;

    const emptyDays: BookingCalendarDay[] =
      Array.from(
        {
          length: firstDayOffset,
        },
        () => ({
          day: '',
          isDisabled: false,
        })
      );

    const monthDays: BookingCalendarDay[] =
      Array.from(
        {
          length: daysInMonth,
        },
        (_, index) => {
          const date = startOfMonth.plus({
            days: index,
          });

          const isDisabled = this.isDayDisabled(
            date.day,
            monthIndex
          );

          const restrictedMode =
            this.getRestrictedMode(
              date.day,
              monthIndex
            );

          const disabledHours =
            this.getDisabledHoursForUser(
              date.day,
              monthIndex
            );

          return {
            day: date.day,
            dayOfWeek: date
              .setLocale('es')
              .toFormat('cccc')
              .toUpperCase(),
            date: date.toFormat('yyyy-MM-dd'),
            isDisabled,
            hasDisabledHours:
              disabledHours.length > 0,
            restrictedMode,
          };
        }
      );

    this.currentMonthDays = [
      ...emptyDays,
      ...monthDays,
    ];
  }

  private getDisabledHoursForUser(
    day: number,
    monthIndex: number
  ): number[] {
    const monthData =
      this.disabledDatesAndHours[
        monthIndex.toString()
      ] ?? [];

    const userClass = this.normalizeValue(
      this.userClassification
    );

    const userCity = this.normalizeValue(
      this.userCity
    );

    const applicableRules = monthData.filter(
      (rule: any) => {
        if (
          Number(rule.day) !== Number(day)
        ) {
          return false;
        }

        const ruleClass = this.normalizeValue(
          rule.studentClassification
        );

        const ruleCity = this.normalizeValue(
          rule.city
        );

        const classMatch =
          ruleClass === null ||
          ruleClass === userClass;

        const cityMatch =
          ruleCity === null ||
          ruleCity === userCity;

        return classMatch && cityMatch;
      }
    );

    const disabledHours =
      applicableRules.flatMap(
        (rule: any) =>
          Array.isArray(rule.hours)
            ? rule.hours
            : []
      );

    return Array.from(
      new Set<number>(disabledHours)
    );
  }

  private updateNavigationButtons(): void {
    const today = DateTime.now()
      .setZone('America/Guayaquil')
      .startOf('month');

    const selectedDate = DateTime.fromObject(
      {
        year: this.selectedYear,
        month:
          this.getMonthIndex(
            this.selectedMonth
          ) + 1,
        day: 1,
      },
      {
        zone: 'America/Guayaquil',
      }
    );

    const nextMonth = today.plus({
      months: 1,
    });

    this.canGoBack =
      selectedDate > today;

    this.canGoForward =
      selectedDate < nextMonth;
  }

  private getMonthIndex(
    monthName: string
  ): number {
    const monthMap: Record<MonthKey, number> = {
      ENERO: 0,
      FEBRERO: 1,
      MARZO: 2,
      ABRIL: 3,
      MAYO: 4,
      JUNIO: 5,
      JULIO: 6,
      AGOSTO: 7,
      SEPTIEMBRE: 8,
      OCTUBRE: 9,
      NOVIEMBRE: 10,
      DICIEMBRE: 11,
    };

    return (
      monthMap[monthName as MonthKey] ?? -1
    );
  }

  private normalizeValue(
    value: unknown
  ): string | null {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return null;
    }

    return value
      .toString()
      .trim()
      .toUpperCase();
  }

  private padNumber(value: number): string {
    return value
      .toString()
      .padStart(2, '0');
  }
}