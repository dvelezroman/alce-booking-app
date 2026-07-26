import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type WeeklyClassTone =
  | 'blue'
  | 'purple'
  | 'yellow'
  | 'green'
  | 'cyan'
  | 'pink';

type WeeklyDay = {
  id: number;
  dayName: string;
  dayNumber: number;
  classesCount: number;
  isCurrentDay?: boolean;
  classTones: WeeklyClassTone[];
};

@Component({
  selector: 'app-instructor-weekly-overview',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './instructor-weekly-overview.component.html',
  styleUrl: './instructor-weekly-overview.component.scss',
})
export class InstructorWeeklyOverviewComponent {
  readonly weekDays: WeeklyDay[] = [
    {
      id: 1,
      dayName: 'Lun',
      dayNumber: 19,
      classesCount: 4,
      classTones: [
        'blue',
        'green',
        'yellow',
        'purple',
      ],
    },
    {
      id: 2,
      dayName: 'Mar',
      dayNumber: 20,
      classesCount: 5,
      isCurrentDay: true,
      classTones: [
        'purple',
        'blue',
        'yellow',
        'purple',
        'yellow',
      ],
    },
    {
      id: 3,
      dayName: 'Mié',
      dayNumber: 21,
      classesCount: 3,
      classTones: [
        'blue',
        'yellow',
        'green',
        'purple',
      ],
    },
    {
      id: 4,
      dayName: 'Jue',
      dayNumber: 22,
      classesCount: 4,
      classTones: [
        'green',
        'yellow',
        'blue',
        'yellow',
      ],
    },
    {
      id: 5,
      dayName: 'Vie',
      dayNumber: 23,
      classesCount: 2,
      classTones: [
        'blue',
        'cyan',
      ],
    },
    {
      id: 6,
      dayName: 'Sáb',
      dayNumber: 24,
      classesCount: 1,
      classTones: [
        'pink',
      ],
    },
    {
      id: 7,
      dayName: 'Dom',
      dayNumber: 25,
      classesCount: 0,
      classTones: [],
    },
  ];

  trackByDayId(
    index: number,
    day: WeeklyDay
  ): number {
    return day.id;
  }

  trackByToneIndex(index: number): number {
    return index;
  }

  getClassesLabel(count: number): string {
    if (count === 0) {
      return 'Sin clases';
    }

    if (count === 1) {
      return '1 clase';
    }

    return `${count} clases`;
  }

  onDayClick(day: WeeklyDay): void {
    console.log('Día seleccionado:', day);
  }

  onOpenCalendar(): void {
    console.log('Ir al calendario');
  }
}