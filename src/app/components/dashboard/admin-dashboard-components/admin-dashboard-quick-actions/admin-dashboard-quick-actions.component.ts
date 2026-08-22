import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface QuickAction {
  title: string;
  description: string;
  route: string;
  type: 'announcement' | 'notification' | 'report';
}

@Component({
  selector: 'app-admin-dashboard-quick-actions',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './admin-dashboard-quick-actions.component.html',
  styleUrl: './admin-dashboard-quick-actions.component.scss',
})
export class AdminDashboardQuickActionsComponent {

  actions: QuickAction[] = [
    {
      title: 'Crear anuncio',
      description: 'Publica información importante para los usuarios.',
      route: '/dashboard/announcements',
      type: 'announcement',
    },
    {
      title: 'Enviar notificación',
      description: 'Envía una notificación a usuarios o grupos.',
      route: '/dashboard/broadcast-groups-v2',
      type: 'notification',
    },
    {
      title: 'Generar reporte',
      description: 'Consulta los reportes administrativos.',
      route: '/dashboard/report-excel',
      type: 'report',
    },
  ];

}