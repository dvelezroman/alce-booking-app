import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type PerformanceTone =
  | 'purple'
  | 'green'
  | 'yellow';

type PerformanceIcon =
  | 'book'
  | 'check'
  | 'star';

type MonthlyPerformanceMetric = {
  id: number;
  value: number;
  label: string;
  description: string;
  icon: PerformanceIcon;
  tone: PerformanceTone;
  decimalPlaces?: number;
};

@Component({
  selector: 'app-instructor-monthly-performance',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl:
    './instructor-monthly-performance.component.html',
  styleUrl:
    './instructor-monthly-performance.component.scss',
})
export class InstructorMonthlyPerformanceComponent {
  readonly metrics: MonthlyPerformanceMetric[] = [
    {
      id: 1,
      value: 128,
      label: 'Clases impartidas',
      description: 'Este mes',
      icon: 'book',
      tone: 'purple',
    },
    {
      id: 2,
      value: 82,
      label: 'Evaluaciones',
      description: 'Realizadas',
      icon: 'check',
      tone: 'green',
    },
    {
      id: 3,
      value: 9.4,
      label: 'Promedio de los',
      description: 'Estudiantes',
      icon: 'star',
      tone: 'yellow',
      decimalPlaces: 1,
    },
  ];

  trackByMetricId(
    index: number,
    metric: MonthlyPerformanceMetric
  ): number {
    return metric.id;
  }

  formatMetricValue(
    metric: MonthlyPerformanceMetric
  ): string {
    if (metric.decimalPlaces !== undefined) {
      return metric.value.toFixed(
        metric.decimalPlaces
      );
    }

    return metric.value.toString();
  }
}