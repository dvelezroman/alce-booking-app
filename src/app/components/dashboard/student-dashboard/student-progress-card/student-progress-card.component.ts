import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MeetingDTO } from '../../../../services/dtos/booking.dto';


@Component({
  selector: 'app-student-progress-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-progress-card.component.html',
  styleUrl: './student-progress-card.component.scss',
})
export class StudentProgressCardComponent {
  @Input() meetings: MeetingDTO[] = [];
  @Input() isLoading = false;

  get totalClasses(): number {
    return this.meetings.length;
  }

  get progressPercentage(): number {
    if (this.totalClasses === 0) {
      return 0;
    }

    /*
     * Progreso visual provisional.
     * Después podemos reemplazarlo por el progreso real del nivel.
     */
    return Math.min(this.totalClasses * 4, 100);
  }

  get studyStreak(): number {
    const classDates = this.getUniqueClassDates();

    if (classDates.length === 0) {
      return 0;
    }

    const availableDates = new Set(classDates);

    let streak = 0;
    let currentDate = this.startOfDay(new Date());

    /*
     * Si hoy todavía no tiene clase, comenzamos a revisar desde ayer.
     * Esto evita perder la racha antes de que termine el día.
     */
    if (!availableDates.has(this.toDateKey(currentDate))) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    while (availableDates.has(this.toDateKey(currentDate))) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  get progressMessage(): string {
    if (this.totalClasses === 0) {
      return 'Agenda tu primera clase y comienza a avanzar.';
    }

    if (this.progressPercentage < 40) {
      return 'Cada clase te acerca más a tu objetivo.';
    }

    if (this.progressPercentage < 80) {
      return 'Completa más clases y actividades para seguir avanzando.';
    }

    return 'Estás muy cerca de completar tu progreso actual.';
  }

  get streakMessage(): string {
    if (this.studyStreak === 0) {
      return '¡Empieza hoy!';
    }

    if (this.studyStreak === 1) {
      return '¡Buen comienzo!';
    }

    if (this.studyStreak < 7) {
      return '¡Sigue así!';
    }

    if (this.studyStreak < 15) {
      return '¡Excelente!';
    }

    return '¡Imparable!';
  }

  private getUniqueClassDates(): string[] {
    const today = this.startOfDay(new Date());

    return [
      ...new Set(
        this.meetings
          .map((meeting) => this.getMeetingDate(meeting))
          .filter((date): date is Date => {
            return date instanceof Date && !Number.isNaN(date.getTime());
          })
          .map((date) => this.startOfDay(date))
          .filter((date) => date.getTime() <= today.getTime())
          .map((date) => this.toDateKey(date))
      ),
    ].sort((a, b) => b.localeCompare(a));
  }

  private getMeetingDate(meeting: MeetingDTO): Date | null {
    /*
     * Deja aquí el campo real de fecha que tenga MeetingDTO.
     * Por ahora soporta varios nombres comunes.
     */
    const meetingData = meeting as MeetingDTO & {
      date?: string | Date;
      startDate?: string | Date;
      scheduledAt?: string | Date;
      startTime?: string | Date;
      meetingDate?: string | Date;
    };

    const rawDate =
      meetingData.date ??
      meetingData.startDate ??
      meetingData.scheduledAt ??
      meetingData.startTime ??
      meetingData.meetingDate;

    if (!rawDate) {
      return null;
    }

    const parsedDate = new Date(rawDate);

    return Number.isNaN(parsedDate.getTime())
      ? null
      : parsedDate;
  }

  private startOfDay(date: Date): Date {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    return normalizedDate;
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}