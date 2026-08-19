import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import {
  AssessementI,
} from '../../../services/dtos/assessment.dto';

import {
  PlatformAssessmentAssignment,
} from '../../../services/dtos/platform-assessment.dto';

@Component({
  selector: 'app-assessment-reports-summary-cards',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './assessment-reports-summary-cards.component.html',
  styleUrl: './assessment-reports-summary-cards.component.scss',
})
export class AssessmentReportsSummaryCardsComponent {

  @Input() assessments: AssessementI[] = [];

  @Input() platformAssessments: PlatformAssessmentAssignment[] = [];

  @Input() maxPointsAssessment: number | null = null;

  @Input() minPointsAssessment: number | null = null;


  get totalAssessments(): number {
    return (
      this.assessments.length +
      this.platformAssessments.length
    );
  }


  get instructorAssessments(): number {
    return this.assessments.length;
  }


  get platformAssessmentsCount(): number {
    return this.platformAssessments.length;
  }


  get averageScore(): number {
    const instructorPoints =
      this.assessments
        .map(
          assessment =>
            Number(
              assessment.points ?? 0,
            ),
        )
        .filter(
          points =>
            Number.isFinite(points),
        );


    const platformPoints =
      this.platformAssessments
        .map(
          assessment =>
            Number(
              assessment.points ?? 0,
            ),
        )
        .filter(
          points =>
            Number.isFinite(points),
        );


    const points = [
      ...instructorPoints,
      ...platformPoints,
    ];


    if (!points.length) {
      return 0;
    }


    const total =
      points.reduce(
        (sum, points) =>
          sum + points,
        0,
      );


    return Number(
      (
        total /
        points.length
      ).toFixed(1),
    );
  }


  get passedAssessments(): number {
    const minimum =
      this.minPointsAssessment ??
      0;


    const instructorPassed =
      this.assessments
        .filter(
          assessment =>
            Number(
              assessment.points ?? 0,
            ) >= minimum,
        )
        .length;


    const platformPassed =
      this.platformAssessments
        .filter(
          assessment =>
            Number(
              assessment.points ?? 0,
            ) >= minimum,
        )
        .length;


    return (
      instructorPassed +
      platformPassed
    );
  }


  get passedPercentage(): number {
    if (!this.totalAssessments) {
      return 0;
    }


    return Number(
      (
        (
          this.passedAssessments /
          this.totalAssessments
        ) *
        100
      ).toFixed(1),
    );
  }


  get averagePercentage(): number {
    const maximum =
      this.maxPointsAssessment ??
      100;


    if (!maximum) {
      return 0;
    }


    return Math.min(
      100,
      Number(
        (
          (
            this.averageScore /
            maximum
          ) *
          100
        ).toFixed(1),
      ),
    );
  }


  formatNumber(
    value: number,
  ): string {
    return new Intl.NumberFormat(
      'es-EC',
    ).format(value);
  }

}