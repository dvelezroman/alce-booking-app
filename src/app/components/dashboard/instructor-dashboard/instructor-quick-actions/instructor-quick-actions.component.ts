import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { LeadSchedulingPendingCountService } from '../../../../services/lead-scheduling-pending-count.service';
import { UserRole } from '../../../../services/dtos/user.dto';

type QuickActionTone =
  | 'purple'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'red'
  | 'indigo';

type QuickActionIcon =
  | 'calendar'
  | 'evaluation'
  | 'progress'
  | 'notification'
  | 'email'
  | 'scheduling';

type InstructorQuickAction = {
  title: string;
  description: string;
  route: string;
  queryParams?: Record<string, string>;
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
export class InstructorQuickActionsComponent implements OnInit, OnDestroy {
  pendingAssignmentCount = 0;
  scheduledReportPendingCount = 0;

  private readonly subs = new Subscription();

  constructor(
    private readonly leadSchedulingPending: LeadSchedulingPendingCountService,
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.leadSchedulingPending.instructorPendingAssignmentCount$.subscribe(
        (count) => (this.pendingAssignmentCount = count),
      ),
    );
    this.subs.add(
      this.leadSchedulingPending.instructorScheduledReportPendingCount$.subscribe(
        (count) => (this.scheduledReportPendingCount = count),
      ),
    );
    this.leadSchedulingPending.refresh(UserRole.INSTRUCTOR).subscribe();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get actions(): InstructorQuickAction[] {
    const pending = this.pendingAssignmentCount;
    const report = this.scheduledReportPendingCount;
    const total = pending + report;
    const schedulingDescription =
      total > 0
        ? `${pending} por atender · ${report} informe pendiente`
        : 'Cortesía, speaking y ubicación';

    return [
      {
        title: 'Mi calendario',
        description: 'Ver todas mis clases asignadas',
        route: '/dashboard/searching-meeting-instructor-v2',
        tone: 'purple',
        icon: 'calendar',
        ariaLabel: 'Ir al calendario de clases asignadas',
      },
      {
        title: 'Solicitudes de agendamiento',
        description: schedulingDescription,
        route: '/dashboard/instructor/lead-scheduling-requests',
        tone: 'indigo',
        icon: 'scheduling',
        ariaLabel: 'Ir a solicitudes de agendamiento',
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
}
