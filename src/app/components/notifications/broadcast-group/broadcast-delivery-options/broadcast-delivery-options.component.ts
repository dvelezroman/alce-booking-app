import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Stage } from '../../../../services/dtos/student.dto';


type SelectedAction =
  | 'user'
  | 'stage'
  | 'group'
  | 'role'
  | 'segment'
  | '';

type DeliveryMode =
  | 'now'
  | 'scheduled';

type ExpirationMode =
  | 'none'
  | 'defined';

type TemporalWindowType =
  | 'FIXED_DAYS'
  | 'ROLLING';


export interface BroadcastDeliveryOptionsValue {
  scheduledAt?: string;
  expiresAt?: string;

  isPersistent: boolean;
  isDeletable: boolean;

  isTemporal: boolean;
  temporalWindowType?: TemporalWindowType;
  temporalWindowValue?: number;
  temporalWindowStart?: string;
  temporalWindowEnd?: string;
  temporalStageId?: number;
}


@Component({
  selector: 'app-broadcast-delivery-options',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './broadcast-delivery-options.component.html',
  styleUrl: './broadcast-delivery-options.component.scss',
})
export class BroadcastDeliveryOptionsComponent implements OnChanges {

  /* =========================
     INPUTS
  ========================= */

  @Input() selectedAction: SelectedAction = '';

  @Input() selectedStage: Stage | null = null;

  @Input() stages: Stage[] = [];

  @Input() reset = false;


  /* =========================
     OUTPUT
  ========================= */

  @Output() deliveryOptionsChanged =
    new EventEmitter<BroadcastDeliveryOptionsValue>();


  /* =========================
     DELIVERY
  ========================= */

  deliveryMode: DeliveryMode = 'now';

  scheduledDate = '';

  scheduledTime = '';


  /* =========================
     EXPIRATION
  ========================= */

  expirationMode: ExpirationMode = 'none';

  expirationDate = '';

  expirationTime = '';


  /* =========================
     ADVANCED
  ========================= */

  isPersistent = false;

  isDeletable = false;

  isTemporal = false;


  /* =========================
     TEMPORAL
  ========================= */

  temporalWindowType: TemporalWindowType = 'FIXED_DAYS';

  temporalWindowValue: number | null = null;

  temporalWindowStart = '';

  temporalWindowEnd = '';

  temporalStageId: number | null = null;

  showTemporalStageDropdown = false;


  /* =========================
     CHANGES
  ========================= */

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['reset'] &&
      this.reset
    ) {
      this.resetOptions();
    }

    if (
      changes['selectedStage'] &&
      this.selectedStage &&
      this.selectedAction === 'stage'
    ) {
      this.temporalStageId =
        this.selectedStage.id;
    }
  }


  /* =========================
     STATE
  ========================= */

  get isEnabled(): boolean {
    return !!this.selectedAction;
  }


  /* =========================
     DELIVERY MODE
  ========================= */

  selectDeliveryMode(
    mode: DeliveryMode,
  ): void {
    this.deliveryMode = mode;

    if (mode === 'now') {
      this.scheduledDate = '';
      this.scheduledTime = '';
    }

    this.emitValue();
  }


  get isSendNow(): boolean {
    return this.deliveryMode === 'now';
  }


  get isScheduled(): boolean {
    return this.deliveryMode === 'scheduled';
  }


  onScheduledDateChange(
    value: string,
  ): void {
    this.scheduledDate = value;

    this.emitValue();
  }


  onScheduledTimeChange(
    value: string,
  ): void {
    this.scheduledTime = value;

    this.emitValue();
  }


  /* =========================
     EXPIRATION
  ========================= */

  selectExpirationMode(
    mode: ExpirationMode,
  ): void {
    this.expirationMode = mode;

    if (mode === 'none') {
      this.expirationDate = '';
      this.expirationTime = '';
    }

    this.emitValue();
  }


  get hasNoExpiration(): boolean {
    return this.expirationMode === 'none';
  }


  get hasExpiration(): boolean {
    return this.expirationMode === 'defined';
  }


  onExpirationDateChange(
    value: string,
  ): void {
    this.expirationDate = value;

    this.emitValue();
  }


  onExpirationTimeChange(
    value: string,
  ): void {
    this.expirationTime = value;

    this.emitValue();
  }


  /* =========================
     PERSISTENT
  ========================= */

  togglePersistent(): void {
    this.isPersistent =
      !this.isPersistent;

    this.emitValue();
  }


  /* =========================
     DELETABLE
  ========================= */

  toggleDeletable(): void {
    this.isDeletable =
      !this.isDeletable;

    this.emitValue();
  }


  /* =========================
     TEMPORAL
  ========================= */

  toggleTemporal(): void {
    this.isTemporal =
      !this.isTemporal;

    if (!this.isTemporal) {
      this.resetTemporalConfiguration();
    }

    this.emitValue();
  }


  selectTemporalWindowType(
    type: TemporalWindowType,
  ): void {
    this.temporalWindowType =
      type;

    this.emitValue();
  }


  onTemporalWindowValueChange(
    value: number | null,
  ): void {
    if (value == null) {
      this.temporalWindowValue = null;

      this.emitValue();

      return;
    }

    const parsed =
      Number(value);

    if (Number.isNaN(parsed)) {
      this.temporalWindowValue = null;

      this.emitValue();

      return;
    }

    this.temporalWindowValue =
      Math.max(
        1,
        parsed,
      );

    this.emitValue();
  }


  onTemporalWindowStartChange(
    value: string,
  ): void {
    this.temporalWindowStart =
      value;

    this.emitValue();
  }


  onTemporalWindowEndChange(
    value: string,
  ): void {
    this.temporalWindowEnd =
      value;

    this.emitValue();
  }


  /* =========================
     TEMPORAL STAGE
  ========================= */

  toggleTemporalStageDropdown(): void {
    if (!this.isTemporal) {
      return;
    }

    this.showTemporalStageDropdown =
      !this.showTemporalStageDropdown;
  }


  selectTemporalStage(
    stage: Stage,
  ): void {
    this.temporalStageId =
      stage.id;

    this.showTemporalStageDropdown =
      false;

    this.emitValue();
  }


  clearTemporalStage(): void {
    this.temporalStageId =
      null;

    this.showTemporalStageDropdown =
      false;

    this.emitValue();
  }


  get selectedTemporalStage(): Stage | null {
    if (this.temporalStageId == null) {
      return null;
    }

    return (
      this.stages.find(
        stage =>
          stage.id ===
          this.temporalStageId,
      ) ??
      null
    );
  }


  get selectedTemporalStageLabel(): string {
    if (!this.selectedTemporalStage) {
      return 'Selecciona un stage';
    }

    return this.getStageLabel(
      this.selectedTemporalStage,
    );
  }


  /* =========================
     DATE HELPERS
  ========================= */

  get scheduledAt(): string | undefined {
    if (
      !this.isScheduled ||
      !this.scheduledDate ||
      !this.scheduledTime
    ) {
      return undefined;
    }

    return `${this.scheduledDate}T${this.scheduledTime}:00`;
  }


  get expiresAt(): string | undefined {
    if (
      !this.hasExpiration ||
      !this.expirationDate ||
      !this.expirationTime
    ) {
      return undefined;
    }

    return `${this.expirationDate}T${this.expirationTime}:00`;
  }


  /* =========================
     VALIDATION
  ========================= */

  get hasValidSchedule(): boolean {
    if (!this.isScheduled) {
      return true;
    }

    return !!(
      this.scheduledDate &&
      this.scheduledTime
    );
  }


  get hasValidExpiration(): boolean {
    if (!this.hasExpiration) {
      return true;
    }

    return !!(
      this.expirationDate &&
      this.expirationTime
    );
  }


  get hasValidTemporalConfiguration(): boolean {
    if (!this.isTemporal) {
      return true;
    }

    if (
      this.temporalWindowType ===
      'FIXED_DAYS'
    ) {
      return !!(
        this.temporalWindowValue &&
        this.temporalWindowValue > 0
      );
    }

    if (
      this.temporalWindowType ===
      'ROLLING'
    ) {
      return !!(
        this.temporalWindowValue &&
        this.temporalWindowValue > 0
      );
    }

    return false;
  }


  get isValid(): boolean {
    return (
      this.hasValidSchedule &&
      this.hasValidExpiration &&
      this.hasValidTemporalConfiguration
    );
  }


  /* =========================
     VALUE
  ========================= */

  get value(): BroadcastDeliveryOptionsValue {
    return {
      ...(this.scheduledAt
        ? {
            scheduledAt:
              this.scheduledAt,
          }
        : {}),

      ...(this.expiresAt
        ? {
            expiresAt:
              this.expiresAt,
          }
        : {}),

      isPersistent:
        this.isPersistent,

      isDeletable:
        this.isDeletable,

      isTemporal:
        this.isTemporal,

      ...(this.isTemporal
        ? {
            temporalWindowType:
              this.temporalWindowType,

            ...(this.temporalWindowValue != null
              ? {
                  temporalWindowValue:
                    this.temporalWindowValue,
                }
              : {}),

            ...(this.temporalWindowStart
              ? {
                  temporalWindowStart:
                    this.temporalWindowStart,
                }
              : {}),

            ...(this.temporalWindowEnd
              ? {
                  temporalWindowEnd:
                    this.temporalWindowEnd,
                }
              : {}),

            ...(this.temporalStageId != null
              ? {
                  temporalStageId:
                    this.temporalStageId,
                }
              : {}),
          }
        : {}),
    };
  }


  private emitValue(): void {
    this.deliveryOptionsChanged.emit(
      this.value,
    );
  }


  /* =========================
     RESET
  ========================= */

  private resetOptions(): void {
    this.deliveryMode = 'now';

    this.scheduledDate = '';
    this.scheduledTime = '';

    this.expirationMode = 'none';

    this.expirationDate = '';
    this.expirationTime = '';

    this.isPersistent = false;

    this.isDeletable = false;

    this.isTemporal = false;

    this.resetTemporalConfiguration();

    this.emitValue();
  }


  private resetTemporalConfiguration(): void {
    this.temporalWindowType =
      'FIXED_DAYS';

    this.temporalWindowValue =
      null;

    this.temporalWindowStart = '';

    this.temporalWindowEnd = '';

    this.temporalStageId =
      this.selectedAction === 'stage'
        ? this.selectedStage?.id ?? null
        : null;

    this.showTemporalStageDropdown =
      false;
  }


  /* =========================
     HELPERS
  ========================= */

  getStageLabel(
    stage: Stage,
  ): string {
    const number =
      String(stage.number ?? '')
        .replace(/[^0-9.]/g, '')
        .trim();

    if (number) {
      return `Stage ${number}`;
    }

    return (
      stage.description ??
      'Stage'
    );
  }


  /* =========================
     TRACK BY
  ========================= */

  trackByStageId(
    index: number,
    stage: Stage,
  ): number {
    return stage.id;
  }

}