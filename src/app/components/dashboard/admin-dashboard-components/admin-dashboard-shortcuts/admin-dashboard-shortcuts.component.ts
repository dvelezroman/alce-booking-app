import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface AdminShortcut {
  title: string;
  description: string;
  route: string;
  type:
    | 'agenda'
    | 'assessment'
    | 'reports'
    | 'progress'
    | 'assessment-reports'
    | 'licenses';
}

@Component({
  selector: 'app-admin-dashboard-shortcuts',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './admin-dashboard-shortcuts.component.html',
  styleUrl: './admin-dashboard-shortcuts.component.scss',
})
export class AdminDashboardShortcutsComponent {

  shortcuts: AdminShortcut[] = [
    {
      title: 'Agenda de meetings',
      description: 'Consulta y administra las clases agendadas.',
      route: '/dashboard/searching-meeting-v2',
      type: 'agenda',
    },
    {
      title: 'Asignar evaluación',
      description: 'Gestiona evaluaciones académicas por Stage.',
      route: '/dashboard/stage-assessment',
      type: 'assessment',
    },
    {
      title: 'Reportes de estudiantes',
      description: 'Consulta reportes detallados de los estudiantes.',
      route: '/dashboard/reports-detailed',
      type: 'reports',
    },
    {
      title: 'Progreso del estudiante',
      description: 'Revisa el avance académico de cada estudiante.',
      route: '/dashboard/reports-progress-v2',
      type: 'progress',
    },
    {
      title: 'Reportes de evaluación',
      description: 'Consulta resultados y reportes de evaluaciones.',
      route: '/dashboard/assessment-reports',
      type: 'assessment-reports',
    },
    {
      title: 'Licencias a estudiantes',
      description: 'Consulta y administra las licencias estudiantiles.',
      route: '/dashboard/suspension-history',
      type: 'licenses',
    },
  ];
}