import { Component, OnInit } from '@angular/core';
import { AssessmentPointsConfigService } from '../../../services/assessment-points-config.service';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { AssessmentDaysConfigFormComponent } from '../../../components/assessment-config/assessment-days-config-form/assessment-days-config-form.component';
import { AssessmentConfigFormComponent } from '../../../components/assessment-config/assessment-max-config/assessment-config-form.component';
import { AssessmentMinConfigComponent } from '../../../components/assessment-config/assessment-min-config/assessment-min-config.component';
import { AssessmentHoursConfigComponent } from '../../../components/assessment-config/assessment-hours-config/assessment-hours-config.component';
import { ModalComponent } from '../../../components/modal/modal.component';


@Component({
  selector: 'app-assessment-config',
  standalone: true,
  imports: [
    AssessmentConfigFormComponent,
    AssessmentMinConfigComponent,
    AssessmentDaysConfigFormComponent,
    AssessmentHoursConfigComponent,
    ModalComponent
  ],
  templateUrl: './assessment-config.component.html',
  styleUrl: './assessment-config.component.scss'
})
export class AssessmentConfigComponent implements OnInit {
  maxPoints: number | null = null;
  minPoints: number | null = null;
  daysAsNewStudent: number | null = null;
  minHoursScheduled: number | null = null;
  modal: ModalDto = modalInitializer();

  constructor(private configService: AssessmentPointsConfigService) {}

  ngOnInit(): void {
    this.configService.getById().subscribe({
      next: (config) => {
        this.maxPoints = config.maxPointsAssessment;
        this.minPoints = config.minPointsAssessment;
        this.daysAsNewStudent = config.numberDaysNewStudent;
        this.minHoursScheduled = config.minHoursScheduled;
      },
      error: () => this.showModal('Error al cargar configuración', true)
    });
  }

  updateMaxPoints(max: number): void {
    this.configService.update(1, max, this.minPoints!, this.daysAsNewStudent!, this.minHoursScheduled!).subscribe({
      next: () => {
        this.maxPoints = max;
        this.showModal('Máximo actualizado', false, true);
      },
      error: () => this.showModal('Error al actualizar máximo', true)
    });
  }

  updateMinPoints(min: number): void {
    this.configService.update(1, this.maxPoints!, min, this.daysAsNewStudent!, this.minHoursScheduled!).subscribe({
      next: () => {
        this.minPoints = min;
        this.showModal('Mínimo actualizado', false, true);
      },
      error: () => this.showModal('Error al actualizar mínimo', true)
    });
  }

  updateDays(days: number): void {
    this.configService.update(1, this.maxPoints!, this.minPoints!, days, this.minHoursScheduled! ).subscribe({
      next: () => {
        this.daysAsNewStudent = days;
        this.showModal('Días actualizados', false, true);
      },
      error: () => this.showModal('Error al actualizar días', true)
    });
  }

  updateMinHoursScheduled(hours: number): void {
    this.configService.update(1, this.maxPoints!, this.minPoints!, this.daysAsNewStudent!, hours).subscribe({
      next: () => {
        this.minHoursScheduled = hours;
        this.showModal('Horas mínimas actualizadas', false, true);
      },
      error: () => this.showModal('Error al actualizar horas mínimas', true)
    });
  }

  showModal(message: string, isError = false, isSuccess = false): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message,
      isError,
      isSuccess,
      close: () => (this.modal.show = false)
    };
    setTimeout(() => this.modal.show = false, 2500);
  }
}