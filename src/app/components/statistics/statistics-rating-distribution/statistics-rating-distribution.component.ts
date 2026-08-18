import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import {
  EvaluationStatisticsResponse,
} from '../../../services/dtos/instructor-evaluation.dto';

interface RatingDistributionItem {
  label: string;
  value: number;
  percentage: number;
  modifier:
    | 'excellent'
    | 'good'
    | 'regular'
    | 'low';
}

type NumericRatingDistribution = {
  [key: string]: number | undefined;
};

@Component({
  selector: 'app-statistics-rating-distribution',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './statistics-rating-distribution.component.html',
  styleUrl: './statistics-rating-distribution.component.scss',
})
export class StatisticsRatingDistributionComponent {

  @Input() statistics:
    EvaluationStatisticsResponse | null = null;

  @Input() loading = false;


  /* =========================
     DISTRIBUTION
  ========================= */

  get distribution():
    RatingDistributionItem[] {

    const values =
      this.getDistributionValues();

    const total =
      values.reduce(
        (sum, item) =>
          sum + item.value,
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
      }),
    );
  }


  /* =========================
     SOURCE VALUES
  ========================= */

  private getDistributionValues(): Omit<
    RatingDistributionItem,
    'percentage'
  >[] {

    if (
      !this.statistics ||
      !this.statistics.instructors?.length
    ) {
      return this.emptyDistribution;
    }

    const distribution =
      this.getOverallDistribution();

    return [
      {
        label: '9 - 10',

        value:
          this.getRatingValue(
            distribution,
            9,
          ) +
          this.getRatingValue(
            distribution,
            10,
          ),

        modifier: 'excellent',
      },

      {
        label: '7 - 8.9',

        value:
          this.getRatingValue(
            distribution,
            7,
          ) +
          this.getRatingValue(
            distribution,
            8,
          ),

        modifier: 'good',
      },

      {
        label: '5 - 6.9',

        value:
          this.getRatingValue(
            distribution,
            5,
          ) +
          this.getRatingValue(
            distribution,
            6,
          ),

        modifier: 'regular',
      },

      {
        label: '0 - 4.9',

        value:
          this.getRatingValue(
            distribution,
            1,
          ) +
          this.getRatingValue(
            distribution,
            2,
          ) +
          this.getRatingValue(
            distribution,
            3,
          ) +
          this.getRatingValue(
            distribution,
            4,
          ),

        modifier: 'low',
      },
    ];
  }


  /* =========================
     BUILD OVERALL DISTRIBUTION
  ========================= */

  private getOverallDistribution():
    NumericRatingDistribution {

    const result:
      NumericRatingDistribution = {};

    for (
      let rating = 1;
      rating <= 10;
      rating++
    ) {
      result[String(rating)] = 0;
    }

    this.statistics
      ?.instructors
      ?.forEach(
        instructor => {

          const value =
            instructor as typeof instructor & {
              ratingDistribution?:
                NumericRatingDistribution;
            };

          const distribution =
            value.ratingDistribution;

          if (!distribution) {
            return;
          }

          for (
            let rating = 1;
            rating <= 10;
            rating++
          ) {
            const key =
              String(rating);

            result[key] =
              Number(
                result[key] ?? 0,
              ) +
              Number(
                distribution[key] ?? 0,
              );
          }
        },
      );

    return result;
  }


  /* =========================
     RATING VALUE
  ========================= */

  private getRatingValue(
    distribution:
      NumericRatingDistribution,
    rating: number,
  ): number {

    return Number(
      distribution[
        String(rating)
      ] ?? 0,
    );
  }


  /* =========================
     EMPTY
  ========================= */

  private get emptyDistribution(): Omit<
    RatingDistributionItem,
    'percentage'
  >[] {

    return [
      {
        label: '9 - 10',
        value: 0,
        modifier: 'excellent',
      },

      {
        label: '7 - 8.9',
        value: 0,
        modifier: 'good',
      },

      {
        label: '5 - 6.9',
        value: 0,
        modifier: 'regular',
      },

      {
        label: '0 - 4.9',
        value: 0,
        modifier: 'low',
      },
    ];
  }


  /* =========================
     TOTAL
  ========================= */

  get totalEvaluations(): number {

    return this.distribution.reduce(
      (sum, item) =>
        sum + item.value,
      0,
    );
  }


  /* =========================
     BAR WIDTH
  ========================= */

  getBarWidth(
    percentage: number,
  ): string {

    const normalized =
      Math.min(
        100,
        Math.max(
          0,
          percentage,
        ),
      );

    return `${normalized}%`;
  }


  /* =========================
     TRACK
  ========================= */

  trackByLabel(
    index: number,
    item: RatingDistributionItem,
  ): string {

    return item.label;
  }
}