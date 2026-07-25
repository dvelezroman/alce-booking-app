import {
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MeetingDTO } from '../../../../services/dtos/booking.dto';

type StudyStreakDay = {
  date: Date;
  dateKey: string;
  label: string;
  isToday: boolean;
  isCompleted: boolean;
};

@Component({
  selector: 'app-student-study-streak',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-study-streak.component.html',
  styleUrl: './student-study-streak.component.scss',
})
export class StudentStudyStreakComponent {

  @Input() meetings: MeetingDTO[] = [];

  @Input() isLoading = false;

  /**
   * Últimos siete días, incluyendo el día actual.
   */
  get streakDays(): StudyStreakDay[] {
    const today = this.startOfDay(new Date());
    const completedDates = this.getCompletedDateKeys();

    return Array.from(
      { length: 7 },
      (_, index) => {
        const daysAgo = 6 - index;

        const date = new Date(today);
        date.setDate(today.getDate() - daysAgo);

        const dateKey = this.formatDateKey(date);
        const isToday = dateKey === this.formatDateKey(today);

        return {
          date,
          dateKey,
          label: isToday
            ? 'Hoy'
            : this.getDayLabel(date),
          isToday,
          isCompleted: completedDates.has(dateKey),
        };
      }
    );
  }

  /**
   * Número de días consecutivos estudiados.
   *
   * Si todavía no hay actividad hoy, la racha puede
   * continuar tomando como referencia el día de ayer.
   */
  get currentStreak(): number {
    const completedDates = this.getCompletedDateKeys();

    if (completedDates.size === 0) {
      return 0;
    }

    const today = this.startOfDay(new Date());
    const todayKey = this.formatDateKey(today);

    const cursor = new Date(today);

    if (!completedDates.has(todayKey)) {
      cursor.setDate(cursor.getDate() - 1);
    }

    let streak = 0;

    while (
      completedDates.has(
        this.formatDateKey(cursor)
      )
    ) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }

  get streakTitle(): string {
    return this.currentStreak === 1
      ? '1 día'
      : `${this.currentStreak} días`;
  }

  get motivationalMessage(): string {
    const streak = this.currentStreak;

    if (streak === 0) {
      return 'Empieza hoy y construye tu racha de estudio.';
    }

    if (streak < 3) {
      return 'Buen comienzo. Sigue practicando cada día.';
    }

    if (streak < 7) {
      return '¡Sigue así! La constancia es la clave.';
    }

    if (streak < 14) {
      return '¡Excelente progreso! Mantén el ritmo.';
    }

    return 'Tu constancia está dando resultados. Continúa así.';
  }

  trackByDate(
    _index: number,
    day: StudyStreakDay
  ): string {
    return day.dateKey;
  }

  /**
   * Obtiene las fechas únicas en las que el estudiante
   * registra una clase.
   */
  private getCompletedDateKeys(): Set<string> {
    const dates = new Set<string>();

    for (const meeting of this.meetings) {
      const date = this.getMeetingDate(meeting);

      if (!date) {
        continue;
      }

      dates.add(this.formatDateKey(date));
    }

    return dates;
  }

  /**
   * Prioriza localdate para evitar diferencias
   * por zona horaria.
   */
  private getMeetingDate(
    meeting: MeetingDTO
  ): Date | null {
    const value =
      meeting.localdate ??
      meeting.date;

    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return this.startOfDay(value);
    }

    const dateText = String(value);
    const datePart = dateText.split('T')[0];

    const [year, month, day] = datePart
      .split('-')
      .map(Number);

    if (!year || !month || !day) {
      const parsedDate = new Date(value);

      return Number.isNaN(parsedDate.getTime())
        ? null
        : this.startOfDay(parsedDate);
    }

    return new Date(
      year,
      month - 1,
      day
    );
  }

  private getDayLabel(date: Date): string {
    const label = date.toLocaleDateString(
      'es-ES',
      {
        weekday: 'short',
      }
    );

    const cleanLabel = label
      .replace('.', '')
      .slice(0, 3);

    return (
      cleanLabel.charAt(0).toUpperCase() +
      cleanLabel.slice(1)
    );
  }

  private startOfDay(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  }

  private formatDateKey(date: Date): string {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}