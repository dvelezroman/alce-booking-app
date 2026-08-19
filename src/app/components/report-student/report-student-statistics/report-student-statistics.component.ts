import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { StatisticalDataI } from '../../../services/dtos/meeting-theme.dto';

@Component({
  selector: 'app-report-student-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-student-statistics.component.html',
  styleUrl: './report-student-statistics.component.scss'
})
export class ReportStudentStatisticsComponent {
  @Input() statisticalData: StatisticalDataI | null = null;

  get totalMeetings(): number {
    return this.statisticalData?.total ?? 0;
  }

  get presentCount(): number {
    return this.statisticalData?.present ?? 0;
  }

  get absentCount(): number {
    return this.statisticalData?.absent ?? 0;
  }

  get cancelledCount(): number {
    return this.statisticalData?.cancelled ?? 0;
  }

  get attendancePercentage(): number {
    return this.statisticalData?.present_percentage ?? 0;
  }

  get absencePercentage(): number {
    return this.statisticalData?.absent_percentage ?? 0;
  }

  get cancelledPercentage(): number {
    return this.statisticalData?.cancelled_percentage ?? 0;
  }

  get onlineCount(): number {
    return Number((this.statisticalData as any)?.online ?? 0);
  }

  get presencialCount(): number {
    return Number((this.statisticalData as any)?.presencial ?? 0);
  }

  get noAssignedCount(): number {
    return Number((this.statisticalData as any)?.no_assigned ?? 0);
  }

  get progressStyle(): string {
    return `conic-gradient(
      #4b20e6 0 ${this.attendancePercentage}%,
      #eceaf7 ${this.attendancePercentage}% 100%
    )`;
  }
}