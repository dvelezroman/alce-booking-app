import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentPointsConfigService } from '../../../services/assessment-points-config.service';
import { ModalComponent } from '../../modal/modal.component';
import { ModalDto, modalInitializer } from '../../modal/modal.dto';

@Component({
  selector: 'app-assessment-days-config-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './assessment-days-config-form.component.html',
  styleUrl: './assessment-days-config-form.component.scss'
})
export class AssessmentDaysConfigFormComponent implements OnInit {
  showConfigForm: boolean = false;
  daysAsNewStudent!: number;
  minPoints!: number;
  maxPoints!: number;
  modal: ModalDto = modalInitializer();

  constructor(private pointsConfigService: AssessmentPointsConfigService) {}

  ngOnInit(): void {
    this.loadAssessmentConfig();
  }

  loadAssessmentConfig(): void {
    this.pointsConfigService.getById().subscribe({
      next: (config) => {
       this.minPoints = config.minPointsAssessment;
        this.maxPoints = config.maxPointsAssessment;
        this.daysAsNewStudent = config.numberDaysNewStudent;
      },
      error: () => {
        this.showNotification('Error al cargar configuración de días', true);
      }
    });
  }

  saveDaysConfig(): void {
    this.pointsConfigService.update(1, this.maxPoints, this.minPoints, this.daysAsNewStudent).subscribe({
      next: () => {
        this.showNotification('Días actualizados correctamente', false, true);
      },
      error: () => {
        this.showNotification('Error al actualizar los días', true);
      }
    });
  }

  showNotification(message: string, isError = false, isSuccess = false): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message,
      isError,
      isSuccess,
      close: () => (this.modal.show = false)
    };

    setTimeout(() => {
      this.modal.show = false;
    }, 2500);
  }
}