import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import { formatRelativeDueDateEs } from '../../../shared/utils/dates.util';
import { computeAssessmentCountdown } from '../../../shared/utils/assessment-countdown.util';

export type AssessmentAssignmentCardVariant = 'platform' | 'stage';

@Component({
  selector: 'app-assessment-assignment-notification-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-assignment-notification-card.component.html',
  styleUrls: ['./assessment-assignment-notification-card.component.scss'],
})
export class AssessmentAssignmentNotificationCardComponent
  implements OnInit, OnDestroy
{
  @Input() variant: AssessmentAssignmentCardVariant = 'platform';
  @Input() title = '';
  @Input() reason: string | null | undefined = 'ASSIGNED';
  @Input() expiresAt: string | null | undefined = null;
  @Input() expiresAtLabel: string | null | undefined = null;
  @Input() maxAttempts: number | null | undefined = null;
  @Input() directAccessUrl: string | null | undefined = null;
  @Input() actionUrl: string | null | undefined = null;
  @Input() stageNumber: number | null | undefined = null;

  timeFormatted = '';
  isUrgent = false;
  isExpired = false;

  private intervalSub?: Subscription;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.tickCountdown();
    this.intervalSub = interval(1000).subscribe(() => this.tickCountdown());
  }

  ngOnDestroy(): void {
    this.intervalSub?.unsubscribe();
  }

  get eyebrow(): string {
    switch (this.reason) {
      case 'RETAKE':
        return 'Puedes volver a intentar';
      case 'DEADLINE_EXTENDED':
        return 'Más tiempo disponible';
      case 'MANUAL_NOTIFY':
        return 'Recordatorio';
      case 'ACCESS_CODE_RESET':
        return 'Acceso listo';
      default:
        return 'Nueva evaluación';
    }
  }

  get lead(): string {
    switch (this.reason) {
      case 'RETAKE':
        return 'Puedes volver a intentar esta evaluación. Complétala antes de la fecha límite.';
      case 'DEADLINE_EXTENDED':
        return 'Te dimos más tiempo. Ya puedes completar la evaluación.';
      case 'MANUAL_NOTIFY':
        return 'No olvides completar esta evaluación.';
      case 'ACCESS_CODE_RESET':
        return 'Hay un acceso nuevo listo. Toca el botón para continuar.';
      default:
        return this.variant === 'stage'
          ? 'Tienes una nueva evaluación. Complétala antes de la fecha límite.'
          : 'Tienes una nueva evaluación. Toca el botón para comenzar.';
    }
  }

  get dueLabel(): string {
    const formatted = formatRelativeDueDateEs(this.expiresAt ?? null);
    if (formatted) {
      return formatted.display;
    }
    if (this.expiresAt == null || this.expiresAt === '') {
      return 'Sin vencimiento';
    }
    return this.expiresAtLabel || 'Fecha no disponible';
  }

  get ctaLabel(): string {
    return 'Comenzar evaluación';
  }

  get canOpen(): boolean {
    if (this.isExpired) {
      return false;
    }
    if (this.variant === 'platform') {
      return !!this.directAccessUrl?.trim();
    }
    return !!this.actionUrl?.trim();
  }

  onCta(): void {
    if (!this.canOpen) {
      return;
    }
    if (this.variant === 'platform' && this.directAccessUrl?.trim()) {
      window.open(this.directAccessUrl.trim(), '_blank', 'noopener,noreferrer');
      return;
    }
    const path = this.actionUrl?.trim();
    if (!path) {
      return;
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
      window.open(path, '_blank', 'noopener,noreferrer');
      return;
    }
    const [pathname, query = ''] = path.split('?');
    const queryParams: Record<string, string> = {};
    if (query) {
      for (const part of query.split('&')) {
        const [key, value] = part.split('=');
        if (key) {
          queryParams[key] = decodeURIComponent(value || '');
        }
      }
    }
    void this.router.navigate([pathname], { queryParams });
  }

  private tickCountdown(): void {
    const result = computeAssessmentCountdown(this.expiresAt ?? null);
    this.timeFormatted = result.timeFormatted;
    this.isUrgent = result.isUrgent;
    this.isExpired = result.isExpired;
  }
}
