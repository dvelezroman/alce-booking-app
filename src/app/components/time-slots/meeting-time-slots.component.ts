import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';
import { DisabledDatesAndHours } from '../../services/dtos/handle-date.dto';
import { convertEcuadorHourToLocal } from '../../shared/utils/dates.util';

@Component({
  selector: 'app-meeting-time-slots',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meeting-time-slots.component.html',
  styleUrl: './meeting-time-slots.component.scss'
})
export class MeetingTimeSlotsComponent implements OnInit, OnChanges {

  @Input() selectedDayInfo: { year: number; month: number; day: number } | null = null;
  @Input() disabledDatesAndHours: DisabledDatesAndHours = {};
  @Input() ecuadorTime: string = '';          // 👈 SE MANTIENE
  @Input() minAllowedHour: number | null = null; // 👈 VIENE DEL PADRE
  @Input() userCity: string | null = null;
  @Input() userMode: string | null = null;
  @Input() userClassification: string | null = null;

  @Output() timeSlotSelected = new EventEmitter<{
    label: string;
    value: number;
    isDisabled: boolean;
    localhour: string;
  }>();

  timeSlots: {
    label: string;
    value: number;
    isDisabled: boolean;
    localhour: string;
  }[] = [];

  hoverIndex: number | null = null;

  ngOnInit(): void {
    if (!this.selectedDayInfo) {
      this.timeSlots = this.generateTimeSlots(8, 20, []);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['selectedDayInfo'] ||
      changes['disabledDatesAndHours'] ||
      changes['minAllowedHour']
    ) {
      if (this.selectedDayInfo) {
        this.recalculateTimeSlots();
      } else {
        this.timeSlots = this.generateTimeSlots(8, 20, []);
      }
    }
  }

  private recalculateTimeSlots(): void {
    if (!this.selectedDayInfo) return;

    const { year, month, day } = this.selectedDayInfo;

    const selectedDate = DateTime.fromObject(
      { year, month, day },
      { zone: 'America/Guayaquil' }
    );

    const todayInEcuador = DateTime.now().setZone('America/Guayaquil');
    const isToday = selectedDate.hasSame(todayInEcuador, 'day'); // ✅ CLAVE

    const isSaturday = selectedDate.weekday === 6;

    const disabledHours = this.getDisabledHoursForDay(day, month - 1);

    const startHour = 8;
    const endHour = 20;
    const saturdayEndHour = 14;
    const effectiveStartHour =
      isToday && this.minAllowedHour !== null
        ? Math.max(startHour, this.minAllowedHour)
        : startHour;
    if (isSaturday) {
      if (effectiveStartHour >= saturdayEndHour) {
        this.timeSlots = [];
      } else {
        this.timeSlots = this.generateTimeSlots(
          effectiveStartHour,
          saturdayEndHour,
          disabledHours
        );
      }
      return;
    }

    if (effectiveStartHour > endHour) {
      this.timeSlots = [];
      return;
    }

    this.timeSlots = this.generateTimeSlots(
      effectiveStartHour,
      endHour,
      disabledHours
    );
  }

  private generateTimeSlots(
    startHour: number,
    endHour: number,
    disabledHours: number[] = []
  ) {
    return Array.from({ length: endHour - startHour + 1 }, (_, i) => {
      const hour = startHour + i;
      const localhour = convertEcuadorHourToLocal(hour);

      return {
        label: `${hour}:00`,
        value: hour,
        localhour: `${localhour}:00`,
        isDisabled: disabledHours.includes(hour)
      };
    });
  }

  private getDisabledHoursForDay(day: number, monthIndex: number): number[] {

    const monthData = this.disabledDatesAndHours[monthIndex.toString()] ?? [];

    const normalize = (v: any) =>
      v ? v.toString().trim().toUpperCase() : null;

    const userClass = normalize(this.userClassification);
    const userCity = normalize(this.userCity);

    const applicableRules = monthData.filter((rule: any) => {

      if (Number(rule.day) !== Number(day)) return false;

      const ruleClass = normalize(rule.studentClassification);
      const ruleCity = normalize(rule.city);

      const classMatch =
        ruleClass === null || ruleClass === userClass;

      const cityMatch =
        ruleCity === null || ruleCity === userCity;

      // 🔴 SOLO bloquear horas globales
      return classMatch && cityMatch && rule.mode === null;

    });

    const hours = applicableRules.flatMap(rule => rule.hours ?? []);

    return Array.from(new Set(hours));
  }

  onTimeSlotClick(slot: {
    label: string;
    value: number;
    isDisabled: boolean;
    localhour: string;
  }) {
    if (!slot.isDisabled) {
      this.timeSlotSelected.emit(slot);
    }
  }
}