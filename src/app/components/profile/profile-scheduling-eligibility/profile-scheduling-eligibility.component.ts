import {
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserDto } from '../../../services/dtos/user.dto';

@Component({
  selector:
    'app-profile-scheduling-eligibility',
  standalone: true,
  imports: [CommonModule],
  templateUrl:
    './profile-scheduling-eligibility.component.html',
  styleUrl:
    './profile-scheduling-eligibility.component.scss',
})
export class ProfileSchedulingEligibilityComponent {
  @Input() user: UserDto | null = null;

  get isStudent(): boolean {
    return (
      this.user?.role
        ?.toString()
        .trim()
        .toUpperCase() === 'STUDENT'
    );
  }

  get canSchedule(): boolean {
    if (!this.isStudent) {
      return false;
    }

    return (
      this.user
        ?.schedulingEligibility
        ?.canScheduleForProgramStage ??
      false
    );
  }

  get eligibilityMessage(): string {
    if (!this.isStudent) {
      return 'Información disponible solo para estudiantes';
    }

    return this.canSchedule
      ? 'Puede agendar para su etapa actual'
      : 'No puede agendar para su etapa actual';
  }

  get eligibilityDescription(): string {
    if (!this.isStudent) {
      return 'La elegibilidad de programación se calcula según la etapa académica del estudiante.';
    }

    return this.canSchedule
      ? 'La programación se encuentra habilitada.'
      : 'La programación no está disponible actualmente.';
  }

  get maxSchedulingStage(): string {
    if (!this.isStudent) {
      return 'No aplica';
    }

    const stage =
      this.user
        ?.schedulingEligibility
        ?.maxSchedulingStage;

    if (
      stage === null ||
      stage === undefined ||
      stage === ''
    ) {
      return '—';
    }

    return this.formatStage(stage);
  }

  get currentStageNumber(): string {
    if (!this.isStudent) {
      return 'No aplica';
    }

    const currentStage =
      this.user
        ?.schedulingEligibility
        ?.currentStageNumber;

    if (
      currentStage !== null &&
      currentStage !== undefined &&
      currentStage !== ''
    ) {
      return this.formatStage(
        currentStage
      );
    }

    const userStage =
      this.user?.stage?.number;

    if (userStage) {
      return userStage;
    }

    const studentStage =
      this.user?.student?.stage?.number;

    return studentStage || '—';
  }

  get schedulingBlockReason(): string | null {
    if (!this.isStudent) {
      return null;
    }

    const reason =
      this.user
        ?.schedulingBlockReason
        ?.trim();

    return reason || null;
  }

  get statusType():
    | 'allowed'
    | 'blocked'
    | 'informative' {
    if (!this.isStudent) {
      return 'informative';
    }

    return this.canSchedule
      ? 'allowed'
      : 'blocked';
  }

  private formatStage(
    value: string | number
  ): string {
    const text = String(value)
      .trim()
      .toUpperCase();

    if (!text) {
      return '—';
    }

    if (
      text.startsWith('STG') ||
      text.startsWith('STAGE')
    ) {
      return text;
    }

    return `STG ${text}`;
  }
}