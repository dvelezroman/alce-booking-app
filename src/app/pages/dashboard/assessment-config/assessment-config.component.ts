import { Component, OnInit } from '@angular/core';
import { AssessmentPointsConfigService } from '../../../services/assessment-points-config.service';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { AssessmentDaysConfigFormComponent } from '../../../components/assessment-config/assessment-days-config-form/assessment-days-config-form.component';
import { AssessmentConfigFormComponent } from '../../../components/assessment-config/assessment-max-config/assessment-config-form.component';
import { AssessmentMinConfigComponent } from '../../../components/assessment-config/assessment-min-config/assessment-min-config.component';
import { AssessmentHoursConfigComponent } from '../../../components/assessment-config/assessment-hours-config/assessment-hours-config.component';
import { AssessmentMaxDaysConfigComponent } from '../../../components/assessment-config/assessment-max-days-config/assessment-max-days-config.component';
import { ModalComponent } from '../../../components/modal/modal.component';

@Component({
  selector: 'app-assessment-config',
  standalone: true,
  imports: [
    AssessmentConfigFormComponent,
    AssessmentMinConfigComponent,
    AssessmentDaysConfigFormComponent,
    AssessmentHoursConfigComponent,
    AssessmentMaxDaysConfigComponent,
    ModalComponent,
  ],
  templateUrl: './assessment-config.component.html',
  styleUrl: './assessment-config.component.scss',
})
export class AssessmentConfigComponent implements OnInit {
  maxPoints: number | null = null;
  minPoints: number | null = null;
  daysAsNewStudent: number | null = null;
  minHoursScheduled: number | null = null;
  maxDaysInCurrentStage: number | null = null;
  modal: ModalDto = modalInitializer();

  constructor(private configService: AssessmentPointsConfigService) {}

  ngOnInit(): void {
    this.configService.getById().subscribe({
      next: (config) => {
        this.maxPoints = config.maxPointsAssessment;
        this.minPoints = config.minPointsAssessment;
        this.daysAsNewStudent = config.numberDaysNewStudent;
        this.minHoursScheduled = config.minHoursScheduled;
        this.maxDaysInCurrentStage = config.maxDaysInCurrentStage ?? 60;
      },
      error: () => this.showModal('Error al cargar configuración', true),
    });
  }

  private persist(
    max: number,
    min: number,
    days: number,
    hours: number,
    maxDays: number,
    successMessage: string,
    errorMessage: string,
    onSuccess: () => void,
  ): void {
    this.configService
      .update(1, max, min, days, hours, maxDays)
      .subscribe({
        next: () => {
          onSuccess();
          this.showModal(successMessage, false, true);
        },
        error: () => this.showModal(errorMessage, true),
      });
  }

  updateMaxPoints(max: number): void {
    this.persist(
      max,
      this.minPoints!,
      this.daysAsNewStudent!,
      this.minHoursScheduled!,
      this.maxDaysInCurrentStage!,
      'Máximo actualizado',
      'Error al actualizar máximo',
      () => {
        this.maxPoints = max;
      },
    );
  }

  updateMinPoints(min: number): void {
    this.persist(
      this.maxPoints!,
      min,
      this.daysAsNewStudent!,
      this.minHoursScheduled!,
      this.maxDaysInCurrentStage!,
      'Mínimo actualizado',
      'Error al actualizar mínimo',
      () => {
        this.minPoints = min;
      },
    );
  }

  updateDays(days: number): void {
    this.persist(
      this.maxPoints!,
      this.minPoints!,
      days,
      this.minHoursScheduled!,
      this.maxDaysInCurrentStage!,
      'Días actualizados',
      'Error al actualizar días',
      () => {
        this.daysAsNewStudent = days;
      },
    );
  }

  updateMinHoursScheduled(hours: number): void {
    this.persist(
      this.maxPoints!,
      this.minPoints!,
      this.daysAsNewStudent!,
      hours,
      this.maxDaysInCurrentStage!,
      'Horas mínimas actualizadas',
      'Error al actualizar horas mínimas',
      () => {
        this.minHoursScheduled = hours;
      },
    );
  }

  updateMaxDaysInCurrentStage(days: number): void {
    this.persist(
      this.maxPoints!,
      this.minPoints!,
      this.daysAsNewStudent!,
      this.minHoursScheduled!,
      days,
      'Días máximos en etapa actualizados',
      'Error al actualizar días máximos en etapa',
      () => {
        this.maxDaysInCurrentStage = days;
      },
    );
  }

  showModal(message: string, isError = false, isSuccess = false): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message,
      isError,
      isSuccess,
      close: () => (this.modal.show = false),
    };
    setTimeout(() => (this.modal.show = false), 2500);
  }
}
