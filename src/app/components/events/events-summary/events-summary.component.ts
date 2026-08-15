import {
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-events-summary',
  standalone: true,
  imports: [],
  templateUrl: './events-summary.component.html',
  styleUrl: './events-summary.component.scss',
})
export class EventsSummaryComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  totalEvents: number = 0;

  @Input()
  loginEvents: number = 0;

  @Input()
  userEvents: number = 0;

  @Input()
  contentEvents: number = 0;

  @Input()
  meetingEvents: number = 0;

  @Input()
  otherEvents: number = 0;


  /* =========================
     PERCENTAGES
  ========================= */

  get loginPercentage(): number {
    return this.getPercentage(
      this.loginEvents,
    );
  }


  get userPercentage(): number {
    return this.getPercentage(
      this.userEvents,
    );
  }


  get contentPercentage(): number {
    return this.getPercentage(
      this.contentEvents,
    );
  }


  get meetingPercentage(): number {
    return this.getPercentage(
      this.meetingEvents,
    );
  }


  get otherPercentage(): number {
    return this.getPercentage(
      this.otherEvents,
    );
  }


  /* =========================
     FORMAT
  ========================= */

  get formattedTotalEvents(): string {
    return this.formatNumber(
      this.totalEvents,
    );
  }


  get formattedLoginEvents(): string {
    return this.formatNumber(
      this.loginEvents,
    );
  }


  get formattedUserEvents(): string {
    return this.formatNumber(
      this.userEvents,
    );
  }


  get formattedContentEvents(): string {
    return this.formatNumber(
      this.contentEvents,
    );
  }


  get formattedMeetingEvents(): string {
    return this.formatNumber(
      this.meetingEvents,
    );
  }


  get formattedOtherEvents(): string {
    return this.formatNumber(
      this.otherEvents,
    );
  }


  /* =========================
     HELPERS
  ========================= */

  private getPercentage(
    value: number,
  ): number {
    if (
      !this.totalEvents ||
      this.totalEvents <= 0
    ) {
      return 0;
    }

    return Number(
      (
        (
          value /
          this.totalEvents
        ) *
        100
      ).toFixed(1),
    );
  }


  private formatNumber(
    value: number,
  ): string {
    return new Intl.NumberFormat(
      'es-EC',
    ).format(
      value || 0,
    );
  }
}