import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-admin-dashboard-stats',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './admin-dashboard-stats.component.html',
  styleUrl: './admin-dashboard-stats.component.scss',
})
export class AdminDashboardStatsComponent {

  @Input()
  totalUsers = 0;

  @Input()
  totalStudents = 0;

  @Input()
  totalInstructors = 0;

  @Input()
  totalAdmins = 0;

  @Input()
  pendingClasses = 0;

  @Input()
  loading = false;

  @Input()
  loadingPendingClasses = false;
}