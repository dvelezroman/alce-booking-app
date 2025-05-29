import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentPointsConfigService } from '../../../services/assessment-points-config.service';
import { ModalComponent } from '../../modal/modal.component';
import { ModalDto, modalInitializer } from '../../modal/modal.dto';

@Component({
  selector: 'app-assessment-config-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './assessment-config-form.component.html',
  styleUrl: './assessment-config-form.component.scss'
})
export class AssessmentConfigFormComponent implements OnInit {
  showConfigForm: boolean = false;
  maxPoints: number | null = null;
  minPoints!: number;
  modal: ModalDto = modalInitializer();

  constructor(private pointsConfigService: AssessmentPointsConfigService) {}

  ngOnInit(): void {
    this.loadAssessmentConfig();
  }

  loadAssessmentConfig(): void {
    this.pointsConfigService.getById().subscribe({
      next: (config) => {
        this.maxPoints = config.maxPointsAssessment;
        this.minPoints = config.minPointsAssessment;
      },
      error: () => {
        this.showNotification('Error al cargar configuración de evaluación', true);
      }
    });
  }

  saveAssessmentConfig(): void {
    this.pointsConfigService.update(1, this.maxPoints!, this.minPoints).subscribe({
      next: () => {
        this.showNotification('Configuración actualizada correctamente', false, true);
      },
      error: () => {
        this.showNotification('Error al actualizar configuración', true);
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