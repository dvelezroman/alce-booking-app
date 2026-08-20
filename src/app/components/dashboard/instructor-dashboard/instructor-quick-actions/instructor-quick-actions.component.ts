import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type QuickActionTone =
  | 'purple'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'red';

type QuickActionIcon =
  | 'calendar'
  | 'evaluation'
  | 'progress'
  | 'notification'
  | 'email';

type InstructorQuickAction = {
  title: string;
  description: string;
  route: string;
  tone: QuickActionTone;
  icon: QuickActionIcon;
  ariaLabel: string;
};

@Component({
  selector: 'app-instructor-quick-actions',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
  ],
  templateUrl: './instructor-quick-actions.component.html',
  styleUrl: './instructor-quick-actions.component.scss',
})
export class InstructorQuickActionsComponent {
  readonly actions: InstructorQuickAction[] = [
    {
      title: 'Mi calendario',
      description: 'Ver todas mis clases asignadas',
      route: '/dashboard/searching-meeting-instructor-v2',
      tone: 'purple',
      icon: 'calendar',
      ariaLabel: 'Ir al calendario de clases asignadas',
    },
    {
      title: 'Evaluar estudiantes',
      description: 'Evaluar clases finalizadas',
      route: '/dashboard/assessment',
      tone: 'blue',
      icon: 'evaluation',
      ariaLabel: 'Ir a evaluar estudiantes',
    },
    {
      title: 'Progreso estudiantes',
      description: 'Buscar y ver progreso de estudiantes',
      route: '/dashboard/reports-progress-v2',
      tone: 'green',
      icon: 'progress',
      ariaLabel: 'Ir al progreso de estudiantes',
    },
    {
      title: 'Notificaciones',
      description: 'Revisa tus notificaciones',
      route: '/dashboard/notifications-inbox',
      tone: 'yellow',
      icon: 'notification',
      ariaLabel: 'Ir a notificaciones',
    },
    {
      title: 'Emails',
      description: 'Ver y responder mensajes',
      route: '/dashboard/historial-email',
      tone: 'red',
      icon: 'email',
      ariaLabel: 'Ir a emails',
    },
  ];
}