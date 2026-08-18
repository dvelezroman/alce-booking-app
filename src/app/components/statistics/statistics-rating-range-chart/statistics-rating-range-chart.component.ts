import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import {
  EvaluationStatisticsResponse,
} from '../../../services/dtos/instructor-evaluation.dto';

interface RatingRangeItem {
  label: string;
  shortLabel: string;
  value: number;
  percentage: number;
  height: number;
  modifier:
    | 'excellent'
    | 'good'
    | 'regular'
    | 'low';
}

@Component({
  selector: 'app-statistics-rating-range-chart',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './statistics-rating-range-chart.component.html',
  styleUrl: './statistics-rating-range-chart.component.scss',
})
export class StatisticsRatingRangeChartComponent {

  @Input() statistics:
    EvaluationStatisticsResponse | null = null;

  @Input() loading = false;

  get ranges(): RatingRangeItem[] {
    const values =
      this.getRangeValues();

    const total =
      values.reduce(
        (sum, item) =>
          sum + item.value,
        0,
      );

    const maxValue =
      Math.max(
        ...values.map(
          item => item.value,
        ),
        0,
      );

    return values.map(
      item => ({
        ...item,

        percentage:
          total > 0
            ? Number(
                (
                  item.value /
                  total *
                  100
                ).toFixed(1),
              )
            : 0,

        height:
          maxValue > 0
            ? Math.max(
                8,
                (
                  item.value /
                  maxValue
                ) * 100,
              )
            : 0,
      }),
    );
  }

  get totalEvaluations(): number {
    return this.ranges.reduce(
      (sum, item) =>
        sum + item.value,
      0,
    );
  }

  get dominantRange(): RatingRangeItem | null {
    if (!this.totalEvaluations) {
      return null;
    }

    return [...this.ranges]
      .sort(
        (a, b) =>
          b.value - a.value,
      )[0] ?? null;
  }

  private getRangeValues(): Omit<
    RatingRangeItem,
    'percentage' | 'height'
  >[] {
    if (!this.statistics) {
      return this.emptyRanges;
    }

    const value =
      this.statistics as EvaluationStatisticsResponse & {
        ratingDistribution?: {
          rating9To10?: number;
          rating7To8?: number;
          rating5To6?: number;
          rating0To4?: number;

          excellent?: number;
          good?: number;
          regular?: number;
          low?: number;

          five?: number;
          four?: number;
          three?: number;
          twoOrLess?: number;
        };

        excellentRatings?: number;
        goodRatings?: number;
        regularRatings?: number;
        lowRatings?: number;
      };

    const distribution =
      value.ratingDistribution;

    return [
      {
        label: 'Excelente',
        shortLabel: '9 - 10',
        value: Number(
          distribution?.rating9To10 ??
          distribution?.excellent ??
          distribution?.five ??
          value.excellentRatings ??
          0,
        ),
        modifier: 'excellent',
      },
      {
        label: 'Bueno',
        shortLabel: '7 - 8.9',
        value: Number(
          distribution?.rating7To8 ??
          distribution?.good ??
          distribution?.four ??
          value.goodRatings ??
          0,
        ),
        modifier: 'good',
      },
      {
        label: 'Regular',
        shortLabel: '5 - 6.9',
        value: Number(
          distribution?.rating5To6 ??
          distribution?.regular ??
          distribution?.three ??
          value.regularRatings ??
          0,
        ),
        modifier: 'regular',
      },
      {
        label: 'Bajo',
        shortLabel: '0 - 4.9',
        value: Number(
          distribution?.rating0To4 ??
          distribution?.low ??
          distribution?.twoOrLess ??
          value.lowRatings ??
          0,
        ),
        modifier: 'low',
      },
    ];
  }

  private get emptyRanges(): Omit<
    RatingRangeItem,
    'percentage' | 'height'
  >[] {
    return [
      {
        label: 'Excelente',
        shortLabel: '9 - 10',
        value: 0,
        modifier: 'excellent',
      },
      {
        label: 'Bueno',
        shortLabel: '7 - 8.9',
        value: 0,
        modifier: 'good',
      },
      {
        label: 'Regular',
        shortLabel: '5 - 6.9',
        value: 0,
        modifier: 'regular',
      },
      {
        label: 'Bajo',
        shortLabel: '0 - 4.9',
        value: 0,
        modifier: 'low',
      },
    ];
  }

  trackByRange(
    index: number,
    item: RatingRangeItem,
  ): string {
    return item.label;
  }
}