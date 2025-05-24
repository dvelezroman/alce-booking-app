import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
  @Input() ecuadorTime: string = '';

  @Output() timeSlotSelected = new EventEmitter<{ label: string; value: number; isDisabled: boolean; localhour: string }>();

  timeSlots: { label: string; value: number; isDisabled: boolean; localhour: string }[] = [];
  hoverIndex: number | null = null;

  ngOnInit(): void {
    if (!this.selectedDayInfo) {
      this.timeSlots = this.generateTimeSlots(8, 20, []);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDayInfo'] || changes['disabledDatesAndHours']) {
      if (this.selectedDayInfo) {
        this.recalculateTimeSlots();
      } else {
        this.timeSlots = this.generateTimeSlots(8, 20, []);
      }
    }
  }

  private recalculateTimeSlots(): void {
    const { year, month, day } = this.selectedDayInfo!;
    const selectedDate = DateTime.fromObject({ year, month, day }, { zone: 'America/Guayaquil' });
    const nowInEcuador = DateTime.now().setZone('America/Guayaquil');

    const isSaturday = selectedDate.weekday === 6;
    const disabledHours = this.getDisabledHoursForDay(day, month - 1);
    const startHour = 8;
    const endHour = 20;
    const saturdayEndHour = 13;

    if (isSaturday) {
      const availableStartHour = selectedDate.hasSame(nowInEcuador, 'day') ? Math.max(startHour, nowInEcuador.hour + 3) : startHour;
      this.timeSlots = availableStartHour >= saturdayEndHour
        ? []
        : this.generateTimeSlots(availableStartHour, saturdayEndHour, disabledHours);
    } else if (selectedDate.hasSame(nowInEcuador, 'day')) {
      if (nowInEcuador.hour >= endHour) {
        this.timeSlots = [];
      } else {
        const availableStartHour = Math.max(startHour, nowInEcuador.hour + 2);
        this.timeSlots = this.generateTimeSlots(availableStartHour, endHour, disabledHours);
      }
    } else {
      this.timeSlots = this.generateTimeSlots(startHour, endHour, disabledHours);
    }
  }

  private generateTimeSlots(startHour: number, endHour: number, disabledHours: number[] = []) {
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
    const monthData = this.disabledDatesAndHours[monthIndex.toString()];
    const dayData = monthData?.find(d => d.day === day);
    return dayData ? dayData.hours : [];
  }

  onTimeSlotClick(slot: { label: string; value: number; isDisabled: boolean; localhour: string }) {
    if (!slot.isDisabled) {
      this.timeSlotSelected.emit(slot);
    }
  }
}