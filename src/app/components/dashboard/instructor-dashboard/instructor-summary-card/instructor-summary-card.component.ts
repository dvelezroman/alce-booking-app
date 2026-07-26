import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

type InstructorSummaryStat = {
  label: string;
  value: string;
  detail: string;
  icon: string;
  tone:
    | 'purple'
    | 'blue'
    | 'green'
    | 'yellow';
};

@Component({
  selector: 'app-instructor-summary-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instructor-summary-card.component.html',
  styleUrl: './instructor-summary-card.component.scss',
})
export class InstructorSummaryCardComponent {
  @Output() calendarClick =
    new EventEmitter<void>();

  readonly classesToday = 5;
  readonly pendingEvaluations = 8;

  readonly stats: InstructorSummaryStat[] = [
    {
      label: 'Clases hoy',
      value: '5',
      detail: '2 cortesía',
      icon: 'pi pi-calendar',
      tone: 'purple',
    },
    {
      label: 'Evaluaciones',
      value: '8',
      detail: 'pendientes',
      icon: 'pi pi-file-edit',
      tone: 'blue',
    },
    {
      label: 'Promedio de satisfacción',
      value: '96%',
      detail: '',
      icon: 'pi pi-star',
      tone: 'green',
    },
    {
      label: 'Horas impartidas',
      value: '22h',
      detail: 'esta semana',
      icon: 'pi pi-clock',
      tone: 'yellow',
    },
  ];

  onCalendarClick(): void {
    this.calendarClick.emit();
  }
}