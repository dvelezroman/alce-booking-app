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

import { DisabledDatesAndHours } from '../../../services/dtos/handle-date.dto';
import { convertEcuadorHourToLocal } from '../../../shared/utils/dates.util';

export interface BookingTimeSlot {
  label: string;
  value: number;
  isDisabled: boolean;
  localhour: string;
}

@Component({
  selector: 'app-booking-time-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-time-list.component.html',
  styleUrl: './booking-time-list.component.scss',
})
export class BookingTimeListComponent
  implements OnInit, OnChanges
{
  @Input() selectedDayInfo: {
    year: number;
    month: number;
    day: number;
  } | null = null;

  @Input() disabledDatesAndHours: DisabledDatesAndHours = {};
  @Input() ecuadorTime = '';
  @Input() minAllowedHour: number | null = null;
  @Input() userCity: string | null = null;
  @Input() userMode: string | null = null;
  @Input() userClassification: string | null = null;
  @Input() selectedTimeSlot: BookingTimeSlot | null = null;

  @Output() timeSlotSelected =
    new EventEmitter<BookingTimeSlot>();

  timeSlots: BookingTimeSlot[] = [];

  ngOnInit(): void {
    if (!this.selectedDayInfo) {
      this.timeSlots = this.generateTimeSlots(
        8,
        20,
        []
      );
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['selectedDayInfo'] ||
      changes['disabledDatesAndHours'] ||
      changes['minAllowedHour'] ||
      changes['userCity'] ||
      changes['userMode'] ||
      changes['userClassification']
    ) {
      if (this.selectedDayInfo) {
        this.recalculateTimeSlots();
      } else {
        this.timeSlots = this.generateTimeSlots(
          8,
          20,
          []
        );
      }
    }
  }

  private recalculateTimeSlots(): void {
    if (!this.selectedDayInfo) {
      return;
    }

    const { year, month, day } =
      this.selectedDayInfo;

    const selectedDate = DateTime.fromObject(
      {
        year,
        month,
        day,
      },
      {
        zone: 'America/Guayaquil',
      }
    );

    const todayInEcuador = DateTime
      .now()
      .setZone('America/Guayaquil');

    const isToday = selectedDate.hasSame(
      todayInEcuador,
      'day'
    );

    const isSaturday =
      selectedDate.weekday === 6;

    const disabledHours =
      this.getDisabledHoursForDay(
        day,
        month - 1
      );

    const startHour = 8;
    const endHour = 20;
    const saturdayEndHour = 14;

    const effectiveStartHour =
      isToday &&
      this.minAllowedHour !== null
        ? Math.max(
            startHour,
            this.minAllowedHour
          )
        : startHour;

    if (isSaturday) {
      if (
        effectiveStartHour >=
        saturdayEndHour
      ) {
        this.timeSlots = [];
        return;
      }

      this.timeSlots =
        this.generateTimeSlots(
          effectiveStartHour,
          saturdayEndHour,
          disabledHours
        );

      return;
    }

    if (effectiveStartHour > endHour) {
      this.timeSlots = [];
      return;
    }

    this.timeSlots =
      this.generateTimeSlots(
        effectiveStartHour,
        endHour,
        disabledHours
      );
  }

  private generateTimeSlots(
    startHour: number,
    endHour: number,
    disabledHours: number[] = []
  ): BookingTimeSlot[] {
    return Array.from(
      {
        length:
          endHour - startHour + 1,
      },
      (_, index) => {
        const hour =
          startHour + index;

        const localHour =
          convertEcuadorHourToLocal(
            hour
          );

        return {
          label: `${hour
            .toString()
            .padStart(2, '0')}:00`,
          value: hour,
          localhour: `${localHour
            .toString()
            .padStart(2, '0')}:00`,
          isDisabled:
            disabledHours.includes(hour),
        };
      }
    );
  }

  private getDisabledHoursForDay(
    day: number,
    monthIndex: number
  ): number[] {
    const monthData =
      this.disabledDatesAndHours[
        monthIndex.toString()
      ] ?? [];

    const normalize = (
      value: unknown
    ): string | null => {
      if (
        value === null ||
        value === undefined
      ) {
        return null;
      }

      return value
        .toString()
        .trim()
        .toUpperCase();
    };

    const userClass = normalize(
      this.userClassification
    );

    const userCity = normalize(
      this.userCity
    );

    const applicableRules =
      monthData.filter(
        (rule: any) => {
          if (!rule) {
            return false;
          }

          if (
            Number(rule.day) !==
            Number(day)
          ) {
            return false;
          }

          const hours =
            Array.isArray(rule.hours)
              ? rule.hours
              : [];

          if (hours.length === 0) {
            return false;
          }

          const ruleClass = normalize(
            rule.studentClassification
          );

          const ruleCity = normalize(
            rule.city
          );

          const ruleMode = normalize(
            rule.mode
          );

          const classMatch =
            ruleClass === null ||
            ruleClass === userClass;

          const cityMatch =
            ruleCity === null ||
            ruleCity === userCity;

          const modeIsGlobal =
            ruleMode === null;

          return (
            classMatch &&
            cityMatch &&
            modeIsGlobal
          );
        }
      );

    const hours =
      applicableRules.flatMap(
        (rule: any) =>
          rule.hours ?? []
      );

    return Array.from(
      new Set<number>(hours)
    );
  }

  onTimeSlotClick(
    slot: BookingTimeSlot
  ): void {
    if (slot.isDisabled) {
      return;
    }

    this.timeSlotSelected.emit(slot);
  }

  isSelected(
    slot: BookingTimeSlot
  ): boolean {
    return (
      this.selectedTimeSlot?.value ===
      slot.value
    );
  }

  getTimeLabel(
    slot: BookingTimeSlot
  ): string {
    if (
      slot.localhour === slot.label
    ) {
      return slot.label;
    }

    return `${slot.label} / ${slot.localhour}`;
  }

  
}