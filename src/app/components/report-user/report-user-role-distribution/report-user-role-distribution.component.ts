import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-report-user-role-distribution',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './report-user-role-distribution.component.html',
  styleUrl: './report-user-role-distribution.component.scss',
})
export class ReportUserRoleDistributionComponent {

  @Input() totalUsers = 0;

  @Input() students = 0;

  @Input() instructors = 0;

  @Input() administrators = 0;

  @Input() others = 0;


  /* =========================
     PERCENTAGES
  ========================= */

  get studentsPercentage(): number {
    return this.getPercentage(
      this.students,
    );
  }

  get instructorsPercentage(): number {
    return this.getPercentage(
      this.instructors,
    );
  }

  get administratorsPercentage(): number {
    return this.getPercentage(
      this.administrators,
    );
  }

  get othersPercentage(): number {
    return this.getPercentage(
      this.others,
    );
  }


  /* =========================
     DONUT
  ========================= */

  get donutBackground(): string {
    if (!this.totalUsers) {
      return '#eef0f4';
    }

    const studentsEnd =
      this.studentsPercentage;

    const instructorsEnd =
      studentsEnd +
      this.instructorsPercentage;

    const administratorsEnd =
      instructorsEnd +
      this.administratorsPercentage;

    return `
      conic-gradient(
        #5639df 0% ${studentsEnd}%,
        #2ca76a ${studentsEnd}% ${instructorsEnd}%,
        #e0a02b ${instructorsEnd}% ${administratorsEnd}%,
        #8c8da0 ${administratorsEnd}% 100%
      )
    `;
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