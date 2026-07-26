import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type ClassMode = 'online' | 'presential';
type ClassType = 'regular' | 'courtesy';

type InstructorUpcomingClass = {
  id: number;
  time: string;
  period: 'AM' | 'PM';
  name: string;
  mode: ClassMode;
  type: ClassType;
  studentsCount: number;
  location: string;
  startsInMinutes?: number;
};

@Component({
  selector: 'app-instructor-upcoming-classes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instructor-upcoming-classes.component.html',
  styleUrl: './instructor-upcoming-classes.component.scss',
})
export class InstructorUpcomingClassesComponent {
  readonly upcomingClasses: InstructorUpcomingClass[] = [
    {
      id: 1,
      time: '10:00',
      period: 'AM',
      name: 'Business English',
      mode: 'online',
      type: 'regular',
      studentsCount: 12,
      location: 'Google Meet',
      startsInMinutes: 8,
    },
    {
      id: 2,
      time: '11:30',
      period: 'AM',
      name: 'Clase de cortesía',
      mode: 'presential',
      type: 'courtesy',
      studentsCount: 1,
      location: 'Aula 2 - Sede Norte',
    },
    {
      id: 3,
      time: '02:00',
      period: 'PM',
      name: 'Conversational English',
      mode: 'online',
      type: 'regular',
      studentsCount: 8,
      location: 'Google Meet',
    },
    {
      id: 4,
      time: '04:30',
      period: 'PM',
      name: 'Grammar in Use',
      mode: 'online',
      type: 'regular',
      studentsCount: 10,
      location: 'Google Meet',
    },
  ];

  trackByClassId(
    index: number,
    classItem: InstructorUpcomingClass
  ): number {
    return classItem.id;
  }

  getModeLabel(mode: ClassMode): string {
    return mode === 'online'
      ? 'Online'
      : 'Presencial';
  }

  getStudentLabel(count: number): string {
    return count === 1
      ? '1 estudiante'
      : `${count} estudiantes`;
  }

  onViewCalendar(): void {
    console.log('Ir al calendario completo');
  }

  onOpenClass(
    classItem: InstructorUpcomingClass
  ): void {
    console.log(
      'Abrir clase:',
      classItem
    );
  }

  onViewDetails(
    classItem: InstructorUpcomingClass
  ): void {
    console.log(
      'Ver detalles:',
      classItem
    );
  }
}