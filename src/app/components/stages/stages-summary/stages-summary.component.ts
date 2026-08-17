import {
  Component,
  Input,
} from '@angular/core';

import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-stages-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './stages-summary.component.html',
  styleUrl: './stages-summary.component.scss',
})
export class StagesSummaryComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  total = 0;


  /* =========================
     SUMMARY
  ========================= */

  get activeStages(): number {
    return this.total;
  }


  get activePercentage(): number {
    return this.total > 0
      ? 100
      : 0;
  }


  get averageProgress(): number {
    /*
     * Temporal hasta tener este dato
     * disponible desde backend.
     */
    return 78;
  }


  get lastUpdateTime(): string {
    return new Intl.DateTimeFormat(
      'es-EC',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    ).format(new Date());
  }


  get lastUpdateDate(): string {
    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      },
    ).format(new Date());
  }
}