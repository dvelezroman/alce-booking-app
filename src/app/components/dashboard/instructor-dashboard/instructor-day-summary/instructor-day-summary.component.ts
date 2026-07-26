import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type SummaryStatus =
  | 'completed'
  | 'pending'
  | 'upcoming';

type SummaryIcon =
  | 'check'
  | 'clock'
  | 'calendar'
  | 'evaluation';

type DaySummaryMetric = {
  id: number;
  label: string;
  value: number;
  icon: SummaryIcon;
  tone: 'green' | 'blue' | 'purple';
};

type DaySummaryActivity = {
  id: number;
  time: string;
  title: string;
  description: string;
  status: SummaryStatus;
};

@Component({
  selector: 'app-instructor-day-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './instructor-day-summary.component.html',
  styleUrl: './instructor-day-summary.component.scss',
})
export class InstructorDaySummaryComponent {
  readonly completedClasses: number = 2; 
  readonly totalClasses: number = 5;

  readonly metrics: DaySummaryMetric[] = [
    {
      id: 1,
      label: 'Completadas',
      value: 2,
      icon: 'check',
      tone: 'green',
    },
    {
      id: 2,
      label: 'Por impartir',
      value: 3,
      icon: 'calendar',
      tone: 'blue',
    },
    {
      id: 3,
      label: 'Por evaluar',
      value: 8,
      icon: 'evaluation',
      tone: 'purple',
    },
  ];

  readonly activities: DaySummaryActivity[] = [
    {
      id: 1,
      time: '08:00 AM',
      title: 'English A2',
      description: 'Clase completada',
      status: 'completed',
    },
    {
      id: 2,
      time: '09:00 AM',
      title: 'English B1',
      description: 'Clase completada',
      status: 'completed',
    },
    {
      id: 3,
      time: '10:00 AM',
      title: 'Business English',
      description: 'Próxima clase',
      status: 'upcoming',
    },
    {
      id: 4,
      time: '11:30 AM',
      title: 'Clase de cortesía',
      description: 'Pendiente',
      status: 'pending',
    },
  ];

  get progressPercentage(): number {
    if (this.totalClasses === 0) {
      return 0;
    }

    return Math.round(
      (this.completedClasses / this.totalClasses) * 100
    );
  }

  trackByMetricId(
    index: number,
    metric: DaySummaryMetric
  ): number {
    return metric.id;
  }

  trackByActivityId(
    index: number,
    activity: DaySummaryActivity
  ): number {
    return activity.id;
  }

  getStatusLabel(status: SummaryStatus): string {
    const labels: Record<SummaryStatus, string> = {
      completed: 'Completada',
      pending: 'Pendiente',
      upcoming: 'Próxima',
    };

    return labels[status];
  }

  onViewDetails(): void {
    console.log('Ver resumen completo del día');
  }
}