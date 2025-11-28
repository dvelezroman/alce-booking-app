import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StageAssessmentService } from '../../../services/stage-assessment.service';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../../store/user.selector';
import { UserDto } from '../../../services/dtos/user.dto';
import { Subscription, interval } from 'rxjs';
import { StageAssessment } from '../../../services/dtos/stage-assessment.dto';

interface CountdownItem {
  id: number;
  description: string;
  dueDate: string;

  days: number;
  hours: string;
  minutes: string;
  seconds: string;

  isUrgent: boolean;
}

@Component({
  selector: 'app-countdown-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown-banner.component.html',
  styleUrls: ['./countdown-banner.component.scss'],
})
export class CountdownBannerComponent implements OnInit, OnDestroy {

  studentId!: number;

  countdowns: CountdownItem[] = [];
  showBanner = false;

  private intervalSub!: Subscription;

  constructor(
    private store: Store,
    private stageAssessmentService: StageAssessmentService
  ) {}

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((u: UserDto | null) => {
      this.studentId = u?.student?.id!;
      if (this.studentId) {
        this.loadAssessments();
      }
    });
  }

  loadAssessments() {
    this.stageAssessmentService.checkActiveByStudent(this.studentId).subscribe({
      next: (res) => {
        if (res.assessments?.length > 0) {

          this.countdowns = res.assessments.map(a => ({
            id: a.id,
            description: a.stageAssessmentResource?.description ?? 'Recurso sin título',
            dueDate: a.dueDate,
            days: 0,
            hours: '00',
            minutes: '00',
            seconds: '00',
            isUrgent: false
          }));

          this.showBanner = true;
          this.startCountdown();
        }
      },
      error: () => {
        this.showBanner = false;
      },
    });
  }

  startCountdown() {
    this.updateAllCountdowns();

    this.intervalSub = interval(1000).subscribe(() => {
      this.updateAllCountdowns();
    });
  }

  private updateAllCountdowns() {
    const now = Date.now();

    this.countdowns = this.countdowns.map(cd => {
      const diff = new Date(cd.dueDate).getTime() - now;

      if (diff <= 0) {
        return { ...cd, days: 0, hours: '00', minutes: '00', seconds: '00', isUrgent: false };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return {
        ...cd,
        days,
        hours: this.pad(hours),
        minutes: this.pad(minutes),
        seconds: this.pad(seconds),
        isUrgent: diff <= 24 * 60 * 60 * 1000
      };
    });
  }

  pad(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

  formatTime(c: any): string {
    if (c.days > 1) {
      return `${c.days} días • ${c.hours}:${c.minutes}:${c.seconds}`;
    }

    if (c.days === 1) {
      return `1 día • ${c.hours}:${c.minutes}:${c.seconds}`;
    }

    return `${c.hours}:${c.minutes}:${c.seconds}`;
  }

  ngOnDestroy() {
    if (this.intervalSub) this.intervalSub.unsubscribe();
  }
}