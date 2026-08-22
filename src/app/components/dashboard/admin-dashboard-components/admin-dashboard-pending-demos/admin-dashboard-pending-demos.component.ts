import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { RouterModule } from '@angular/router';

import {
  LeadSchedulingRequestService,
} from '../../../../services/lead-scheduling-request.service';

import {
  LeadSchedulingRequestRow,
} from '../../../../services/dtos/lead-scheduling-request.dto';


@Component({
  selector: 'app-admin-dashboard-pending-demos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './admin-dashboard-pending-demos.component.html',
  styleUrl: './admin-dashboard-pending-demos.component.scss',
})
export class AdminDashboardPendingDemosComponent
  implements OnInit {

  /* =========================
     STATE
  ========================= */

  requests:
    LeadSchedulingRequestRow[] = [];

  totalPending = 0;

  loading = false;


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private readonly leadScheduling:
      LeadSchedulingRequestService,
  ) {}


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.loadPendingRequests();
  }


  /* =========================
     LOAD
  ========================= */

  private loadPendingRequests(): void {

    this.loading = true;

    this.leadScheduling
      .listAdmin({
        status: 'PENDING',
        limit: 5,
        offset: 0,
      })
      .subscribe({

        next: response => {

          this.requests =
            response.items || [];

          this.totalPending =
            response.total ?? 0;

          this.loading = false;
        },

        error: error => {

          console.error(
            'Error al obtener solicitudes pendientes:',
            error,
          );

          this.requests = [];
          this.totalPending = 0;
          this.loading = false;
        },
      });
  }


  /* =========================
     LEAD DATA
  ========================= */

  getFirstName(
    request: LeadSchedulingRequestRow,
  ): string {

    const row =
      request as any;

    return (
      row.firstName ||
      row.lead?.firstName ||
      row.requester?.firstName ||
      ''
    );
  }


  getLastName(
    request: LeadSchedulingRequestRow,
  ): string {

    const row =
      request as any;

    return (
      row.lastName ||
      row.lead?.lastName ||
      row.requester?.lastName ||
      ''
    );
  }


  getFullName(
    request: LeadSchedulingRequestRow,
  ): string {

    const name =
      `${this.getFirstName(request)} ${this.getLastName(request)}`
        .trim();

    return (
      name ||
      'Solicitante'
    );
  }


  getEmail(
    request: LeadSchedulingRequestRow,
  ): string {

    const row =
      request as any;

    return (
      row.email ||
      row.lead?.email ||
      row.requester?.email ||
      'Sin correo'
    );
  }


  /* =========================
     INITIALS
  ========================= */

  getInitials(
    request: LeadSchedulingRequestRow,
  ): string {

    const firstName =
      this.getFirstName(
        request,
      );

    const lastName =
      this.getLastName(
        request,
      );

    const initials =
      `${firstName.charAt(0)}${lastName.charAt(0)}`;

    return (
      initials ||
      'SD'
    ).toUpperCase();
  }


  /* =========================
     DATE
  ========================= */

  getRequestedAt(
    request: LeadSchedulingRequestRow,
  ): string {

    const row =
      request as any;

    const value =
      row.createdAt ||
      row.requestedAt ||
      row.created_at;

    if (!value) {
      return '—';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '—';
    }

    return date.toLocaleString(
      'es-EC',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  }


  /* =========================
     STATUS
  ========================= */

  getStatusLabel(
    request: LeadSchedulingRequestRow,
  ): string {

    switch (request.status) {

      case 'PENDING':
        return 'Pendiente';

      case 'SCHEDULED':
        return 'Agendada';

      case 'COMPLETED':
        return 'Completada';

      case 'CANCELLED':
        return 'Cancelada';

      default:
        return request.status || '—';
    }
  }


  /* =========================
     TRACK
  ========================= */

  trackByRequestId(
    index: number,
    request: LeadSchedulingRequestRow,
  ): number {

    return (
      request.id ??
      index
    );
  }
}