import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  EvaluationStatisticsResponse,
  InstructorEvaluationStatistics
} from '../../../services/dtos/instructor-evaluation.dto';

@Component({
  selector: 'app-meeting-evaluation-statistics-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meeting-evaluation-statistics-table.component.html',
  styleUrl: './meeting-evaluation-statistics-table.component.scss'
})
export class MeetingEvaluationStatisticsTableComponent {

  @Input() statistics!: EvaluationStatisticsResponse | null;
  @Input() searchAttempted = false;

  get instructors(): InstructorEvaluationStatistics[] {
    return this.statistics?.instructors ?? [];
  }

  formatAverage(value: number): string {
    if (Number.isInteger(value)) {
      return value.toString();
    }

    return value.toFixed(1);
  }
}