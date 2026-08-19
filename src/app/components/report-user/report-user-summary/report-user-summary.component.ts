import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-report-user-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './report-user-summary.component.html',
  styleUrl: './report-user-summary.component.scss',
})
export class ReportUserSummaryComponent {

  @Input() totalUsers = 0;

  @Input() activeUsers = 0;

  @Input() activeUsersPercentage = 0;

  @Input() newStudents = 0;

  @Input() usersWithComments = 0;

  @Input() usersWithCommentsPercentage = 0;

  @Input() usersWithAlerts = 0;

  @Input() usersWithAlertsPercentage = 0;

  @Input() loading = false;


  get inactivePercentage(): number {
    return Math.max(
      0,
      Number(
        (
          100 -
          this.activeUsersPercentage
        ).toFixed(1)
      )
    );
  }
}