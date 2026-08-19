import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { StudentSuspensionHistory } from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-suspension-history-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suspension-history-summary.component.html',
  styleUrl: './suspension-history-summary.component.scss'
})
export class SuspensionHistorySummaryComponent {
  @Input() history: StudentSuspensionHistory[] = [];
  @Input() loading = false;

  get totalLicenses(): number {
    return this.history.length;
  }

  get totalSuspensionDays(): number {
    return this.history.reduce((total, item) => {
      const value = item as StudentSuspensionHistory & {
        days?: number;
        suspensionDays?: number;
        totalDays?: number;
      };

      return total + Number(
        value.days ??
        value.suspensionDays ??
        value.totalDays ??
        0
      );
    }, 0);
  }

  get activeLicenses(): number {
    return this.history.filter((item) => {
      const value = item as StudentSuspensionHistory & {
        active?: boolean;
        status?: string;
        isActive?: boolean;
      };

      if (typeof value.active === 'boolean') {
        return value.active;
      }

      if (typeof value.isActive === 'boolean') {
        return value.isActive;
      }

      return String(value.status ?? '')
        .toLowerCase() === 'active';
    }).length;
  }

  get suspendedClassHours(): number {
    return this.history.reduce((total, item) => {
      const value = item as StudentSuspensionHistory & {
        suspendedHours?: number;
        classHours?: number;
        hours?: number;
      };

      return total + Number(
        value.suspendedHours ??
        value.classHours ??
        value.hours ??
        0
      );
    }, 0);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-EC').format(value);
  }
}