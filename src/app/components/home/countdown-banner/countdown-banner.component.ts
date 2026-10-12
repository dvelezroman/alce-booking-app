import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { StageAssessmentService } from '../../../services/stage-assessment.service';
import { PlatformAssessmentService } from '../../../services/platform-assessment.service';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../../store/user.selector';
import { UserDto } from '../../../services/dtos/user.dto';
import { Subscription, forkJoin, interval, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StageAssessment } from '../../../services/dtos/stage-assessment.dto';
import { PlatformAssessmentAssignment } from '../../../services/dtos/platform-assessment.dto';
import { Router } from '@angular/router';

type CountdownSource = 'stage' | 'platform';

interface CountdownItem {
  key: string;
  source: CountdownSource;
  description: string;
  dueDate: string;
  /** Stage due dates count down to local midnight; platform uses full `expiresAt`. */
  useEndOfDayLocal: boolean;
  hasTimer: boolean;

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

  @Output() pendingCount = new EventEmitter<number>();
  @Output() hasCountdown = new EventEmitter<boolean>();
  @Output() showAnnouncement = new EventEmitter<boolean>();
  @Output() assessmentsLoaded = new EventEmitter<StageAssessment[]>();
  @Output() platformAssessmentsLoaded =
    new EventEmitter<PlatformAssessmentAssignment[]>();

  private intervalSub?: Subscription;

  constructor(
    private store: Store,
    private router: Router,
    private stageAssessmentService: StageAssessmentService,
    private platformAssessmentService: PlatformAssessmentService,
  ) {}

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((u: UserDto | null) => {
      this.studentId = u?.student?.id!;
      if (this.studentId) {
        this.loadAssessments();
      }
    });
  }

  loadAssessments(): void {
    forkJoin({
      stage: this.stageAssessmentService
        .checkActiveByStudent(this.studentId, true)
        .pipe(catchError(() => of({ assessments: [] as StageAssessment[] }))),
      platform: this.platformAssessmentService
        .syncFromRemote(this.studentId)
        .pipe(catchError(() => of([] as PlatformAssessmentAssignment[]))),
    }).subscribe(({ stage, platform }) => {
      const activeStage =
        stage.assessments?.filter((a) => !a.isPastDue) ?? [];
      const pendingPlatform = (platform ?? []).filter(
        (a) => a.status === 'pending',
      );

      this.assessmentsLoaded.emit(activeStage);
      this.platformAssessmentsLoaded.emit(pendingPlatform);

      const stageItems: CountdownItem[] = activeStage.map((a) =>
        this.createCountdownShell(
          `stage-${a.id}`,
          'stage',
          a.stageAssessmentResource?.description ?? 'Recurso sin título',
          a.dueDate,
          true,
          true,
        ),
      );

      const platformItems: CountdownItem[] = pendingPlatform.map((a) =>
        this.createCountdownShell(
          `platform-${a.assignmentId}`,
          'platform',
          a.templateTitle,
          a.expiresAt ?? '',
          false,
          !!a.expiresAt,
        ),
      );

      this.countdowns = [...stageItems, ...platformItems];
      const total = this.countdowns.length;

      this.pendingCount.emit(total);
      this.hasCountdown.emit(total > 0);

      if (total > 0) {
        this.showBanner = true;
        this.startCountdown();
      } else {
        this.showBanner = false;
        if (this.intervalSub) {
          this.intervalSub.unsubscribe();
          this.intervalSub = undefined;
        }
      }
    });
  }

  private createCountdownShell(
    key: string,
    source: CountdownSource,
    description: string,
    dueDate: string,
    useEndOfDayLocal: boolean,
    hasTimer: boolean,
  ): CountdownItem {
    return {
      key,
      source,
      description,
      dueDate,
      useEndOfDayLocal,
      hasTimer,
      days: 0,
      hours: '00',
      minutes: '00',
      seconds: '00',
      isUrgent: false,
    };
  }

  startCountdown(): void {
    if (this.intervalSub) {
      this.intervalSub.unsubscribe();
    }

    this.updateAllCountdowns();

    this.intervalSub = interval(1000).subscribe(() => {
      this.updateAllCountdowns();
    });
  }

  goToAssessment(item: CountdownItem): void {
    if (item.source === 'platform') {
      this.router.navigate(['/dashboard/platform-assessments']);
      return;
    }

    this.router.navigate(['/dashboard/stage-assessment-student']);
  }

  trackByKey(_index: number, item: CountdownItem): string {
    return item.key;
  }

  private targetMs(item: CountdownItem): number | null {
    if (!item.hasTimer || !item.dueDate) {
      return null;
    }

    if (item.useEndOfDayLocal) {
      const [datePart] = item.dueDate.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      return new Date(year, month - 1, day, 0, 0, 0).getTime();
    }

    const target = new Date(item.dueDate).getTime();
    return Number.isFinite(target) ? target : null;
  }

  private updateAllCountdowns(): void {
    const now = Date.now();

    this.countdowns = this.countdowns.map((cd) => {
      const target = this.targetMs(cd);

      if (target == null) {
        return {
          ...cd,
          days: 0,
          hours: '00',
          minutes: '00',
          seconds: '00',
          isUrgent: false,
        };
      }

      const diff = target - now;

      if (diff <= 0) {
        return {
          ...cd,
          days: 0,
          hours: '00',
          minutes: '00',
          seconds: '00',
          isUrgent: false,
        };
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff / 3600000) % 24);
      const minutes = Math.floor((diff / 60000) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return {
        ...cd,
        days,
        hours: this.pad(hours),
        minutes: this.pad(minutes),
        seconds: this.pad(seconds),
        isUrgent: diff <= 24 * 60 * 60 * 1000,
      };
    });
  }

  pad(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

  closeBanner(): void {
    this.showBanner = false;
    this.hasCountdown.emit(false);
  }

  goToHelp(): void {
    window.open(
      'https://youtube.com/shorts/Hp2a3fii9MU?feature=share',
      '_blank',
    );
  }

  ngOnDestroy(): void {
    this.intervalSub?.unsubscribe();
  }
}
