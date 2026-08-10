import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { PlatformAssessmentAssignment } from '../../../services/dtos/platform-assessment.dto';

export type PlatformAssessmentWithCountdown = PlatformAssessmentAssignment & {
  timeFormatted?: string;
  isUrgent?: boolean;
};

@Component({
  selector: 'app-pending-platform-assessment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-platform-assessment-card.component.html',
  styleUrl: './pending-platform-assessment-card.component.scss',
})
export class PendingPlatformAssessmentCardComponent
  implements OnInit, OnDestroy
{
  @Input() set assessments(value: PlatformAssessmentAssignment[]) {
    this._assessments = (value ?? []).map((a) => ({ ...a }));
    this.updateCountdowns();
  }

  @Output() openAssessment = new EventEmitter<PlatformAssessmentAssignment>();
  @Output() viewAll = new EventEmitter<void>();

  private _assessments: PlatformAssessmentWithCountdown[] = [];
  private intervalSub?: Subscription;

  get assessments(): PlatformAssessmentWithCountdown[] {
    return this._assessments;
  }

  ngOnInit(): void {
    this.updateCountdowns();
    this.intervalSub = interval(1000).subscribe(() => this.updateCountdowns());
  }

  ngOnDestroy(): void {
    this.intervalSub?.unsubscribe();
  }

  get visibleAssessments(): PlatformAssessmentWithCountdown[] {
    return this._assessments.slice(0, 3);
  }

  get hasAssessments(): boolean {
    return this._assessments.length > 0;
  }

  updateCountdowns(): void {
    const now = Date.now();

    this._assessments = this._assessments.map((assessment) => {
      if (!assessment.expiresAt) {
        return { ...assessment, timeFormatted: '', isUrgent: false };
      }

      const target = new Date(assessment.expiresAt).getTime();
      if (Number.isNaN(target)) {
        return { ...assessment, timeFormatted: '', isUrgent: false };
      }

      const diff = target - now;
      if (diff <= 0) {
        return {
          ...assessment,
          timeFormatted: 'Tiempo finalizado',
          isUrgent: false,
        };
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff / 3600000) % 24);
      const minutes = Math.floor((diff / 60000) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      let formatted = '';
      if (days > 0) formatted += `${days}d `;
      formatted += `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;

      return {
        ...assessment,
        timeFormatted: formatted,
        isUrgent: diff <= 12 * 60 * 60 * 1000,
      };
    });
  }

  pad(value: number): string {
    return value < 10 ? `0${value}` : value.toString();
  }

  onOpen(assessment: PlatformAssessmentAssignment): void {
    this.openAssessment.emit(assessment);
  }

  onViewAll(): void {
    this.viewAll.emit();
  }

  trackById(_index: number, assessment: PlatformAssessmentAssignment): number {
    return assessment.id;
  }

  stageLabel(assessment: PlatformAssessmentAssignment): string {
    return assessment.studentStage != null
      ? `Stage ${assessment.studentStage}`
      : 'Stage por confirmar';
  }

  expiresLabel(expiresAt: string | null): string {
    if (!expiresAt) return 'Sin fecha de vencimiento';
    const date = new Date(expiresAt);
    if (Number.isNaN(date.getTime())) return 'Fecha por confirmar';
    return date.toLocaleString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
