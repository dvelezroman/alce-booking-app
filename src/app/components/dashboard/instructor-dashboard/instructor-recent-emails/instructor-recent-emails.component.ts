import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type EmailTone =
  | 'purple'
  | 'green'
  | 'yellow';

type InstructorRecentEmail = {
  id: number;
  sender: string;
  subject: string;
  timeAgo: string;
  initial: string;
  tone: EmailTone;
};

@Component({
  selector: 'app-instructor-recent-emails',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl:
    './instructor-recent-emails.component.html',
  styleUrl:
    './instructor-recent-emails.component.scss',
})
export class InstructorRecentEmailsComponent {
  readonly emails: InstructorRecentEmail[] = [
    {
      id: 1,
      sender: 'Administración',
      subject: 'Cambio en el calendario académico',
      timeAgo: 'Hace 20 min',
      initial: 'A',
      tone: 'purple',
    },
    {
      id: 2,
      sender: 'Michael Brown',
      subject: 'Consulta sobre clase de cortesía',
      timeAgo: 'Hace 1 hora',
      initial: 'M',
      tone: 'green',
    },
    {
      id: 3,
      sender: 'Student Support',
      subject: 'Recordatorio: Evaluaciones',
      timeAgo: 'Hace 3 horas',
      initial: 'S',
      tone: 'yellow',
    },
  ];

  trackByEmailId(
    index: number,
    email: InstructorRecentEmail
  ): number {
    return email.id;
  }

  onViewAll(): void {
    console.log('Ver todos los emails');
  }

  onEmailClick(
    email: InstructorRecentEmail
  ): void {
    console.log(
      'Email seleccionado:',
      email
    );
  }
}