import { CommonModule } from '@angular/common';
import {
  Component,
  Input
} from '@angular/core';

import {
  StudentSuspensionHistory
} from '../../../services/dtos/student.dto';

type SuspensionStatus =
  | 'active'
  | 'finished'
  | 'upcoming';

@Component({
  selector: 'app-suspension-history-status-chart',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './suspension-history-status-chart.component.html',
  styleUrl: './suspension-history-status-chart.component.scss'
})
export class SuspensionHistoryStatusChartComponent {

  @Input() history: StudentSuspensionHistory[] = [];

  @Input() loading = false;


  get total(): number {
    return this.history.length;
  }


  get activeCount(): number {
    return this.history
      .filter(
        item =>
          this.getStatus(item) === 'active'
      )
      .length;
  }


  get finishedCount(): number {
    return this.history
      .filter(
        item =>
          this.getStatus(item) === 'finished'
      )
      .length;
  }


  get upcomingCount(): number {
    return this.history
      .filter(
        item =>
          this.getStatus(item) === 'upcoming'
      )
      .length;
  }


  get activePercentage(): number {
    return this.getPercentage(
      this.activeCount
    );
  }


  get finishedPercentage(): number {
    return this.getPercentage(
      this.finishedCount
    );
  }


  get upcomingPercentage(): number {
    return this.getPercentage(
      this.upcomingCount
    );
  }


  get chartStyle(): string {
    if (!this.total) {
      return `
        conic-gradient(
          #eceef3 0deg 360deg
        )
      `;
    }

    const activeEnd =
      this.activePercentage;

    const finishedEnd =
      activeEnd +
      this.finishedPercentage;

    return `
      conic-gradient(
        #4b20e6 0% ${activeEnd}%,
        #42a46d ${activeEnd}% ${finishedEnd}%,
        #efa336 ${finishedEnd}% 100%
      )
    `;
  }


  private getPercentage(
    value: number
  ): number {
    if (!this.total) {
      return 0;
    }

    return Number(
      (
        value /
        this.total *
        100
      ).toFixed(1)
    );
  }


  private getStatus(
    item: StudentSuspensionHistory
  ): SuspensionStatus {

    const value =
      item as StudentSuspensionHistory & {
        active?: boolean;
        isActive?: boolean;
        status?: string;
        startDate?: string;
        start_date?: string;
        suspensionStartDate?: string;
        from?: string;
        endDate?: string;
        end_date?: string;
        suspensionEndDate?: string;
        to?: string;
      };


    if (
      value.active === true ||
      value.isActive === true
    ) {
      return 'active';
    }


    const rawStatus =
      String(
        value.status ?? ''
      )
        .trim()
        .toLowerCase();


    if (
      rawStatus === 'active' ||
      rawStatus === 'activa'
    ) {
      return 'active';
    }


    if (
      rawStatus === 'upcoming' ||
      rawStatus === 'pending' ||
      rawStatus === 'próxima' ||
      rawStatus === 'proxima'
    ) {
      return 'upcoming';
    }


    if (
      rawStatus === 'finished' ||
      rawStatus === 'completed' ||
      rawStatus === 'finalizada' ||
      rawStatus === 'expired'
    ) {
      return 'finished';
    }


    const start =
      new Date(
        value.startDate ??
        value.start_date ??
        value.suspensionStartDate ??
        value.from ??
        ''
      );


    const end =
      new Date(
        value.endDate ??
        value.end_date ??
        value.suspensionEndDate ??
        value.to ??
        ''
      );


    const now =
      new Date();


    if (
      !Number.isNaN(
        start.getTime()
      ) &&
      now < start
    ) {
      return 'upcoming';
    }


    if (
      !Number.isNaN(
        start.getTime()
      ) &&
      !Number.isNaN(
        end.getTime()
      ) &&
      now >= start &&
      now <= end
    ) {
      return 'active';
    }


    return 'finished';
  }

}