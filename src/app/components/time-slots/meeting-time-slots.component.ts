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
      changes['minAllowedHour'] ||
      changes['userCity'] ||
      changes['userClassification']
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
      v === null || v === undefined ? null : v.toString().trim().toUpperCase();

    const userClass = normalize(this.userClassification);
    const userCity = normalize(this.userCity);

    const applicableRules = monthData.filter((rule: any) => {
      if (!rule) return false;
      if (Number(rule.day) !== Number(day)) return false;

      const hours = Array.isArray(rule.hours) ? rule.hours : [];

      // hours: [] significa bloqueo completo, no bloqueo visual de horas.
      if (hours.length === 0) return false;

      const ruleClass = normalize(rule.studentClassification);
      const ruleCity = normalize(rule.city);
      const ruleMode = normalize(rule.mode);

      const classMatch =
        ruleClass === null || ruleClass === userClass;

      const cityMatch =
        ruleCity === null || ruleCity === userCity;

      /**
       * CLAVE:
       * El hijo solo bloquea visualmente horas cuando la regla aplica
       * a todos los modos.
       *
       * Si ruleMode es ONLINE o PRESENCIAL, eso se valida luego
       * en el padre cuando el usuario selecciona el modo.
       */
      const modeIsGlobal = ruleMode === null;

      return classMatch && cityMatch && modeIsGlobal;
    });

    const hours = applicableRules.flatMap((rule: any) => rule.hours ?? []);

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