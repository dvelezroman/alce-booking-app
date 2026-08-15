import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import {
  LeadSchedulingRequestRow,
} from '../../../services/dtos/lead-scheduling-request.dto';

@Component({
  selector: 'app-admin-lead-scheduling-header',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './admin-lead-scheduling-header.component.html',
  styleUrl: './admin-lead-scheduling-header.component.scss',
})
export class AdminLeadSchedulingHeaderComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  total = 0;

  @Input()
  items: LeadSchedulingRequestRow[] = [];

  @Input()
  loading = false;


  /* =========================
     PENDING
  ========================= */

  get pendingCount(): number {
    return this.items.filter(
      item => item.status === 'PENDING',
    ).length;
  }


  /* =========================
     TOTAL LABEL
  ========================= */

  get totalLabel(): string {
    if (this.total === 1) {
      return '1 solicitud';
    }

    return `${this.total} solicitudes`;
  }
}