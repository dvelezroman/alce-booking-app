import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-report-user-status-distribution',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './report-user-status-distribution.component.html',
  styleUrl: './report-user-status-distribution.component.scss',
})
export class ReportUserStatusDistributionComponent {

  @Input() totalUsers = 0;

  @Input() activeUsers = 0;

  @Input() inactiveUsers = 0;

  @Input() suspendedUsers = 0;


  /* =========================
     PERCENTAGES
  ========================= */

  get activePercentage(): number {
    return this.getPercentage(
      this.activeUsers,
    );
  }

  get inactivePercentage(): number {
    return this.getPercentage(
      this.inactiveUsers,
    );
  }

  get suspendedPercentage(): number {
    return this.getPercentage(
      this.suspendedUsers,
    );
  }


  /* =========================
     HELPERS
  ========================= */

  private getPercentage(
    value: number,
  ): number {
    if (!this.totalUsers) {
      return 0;
    }

    return Number(
      (
        value /
        this.totalUsers *
        100
      ).toFixed(1),
    );
  }
}