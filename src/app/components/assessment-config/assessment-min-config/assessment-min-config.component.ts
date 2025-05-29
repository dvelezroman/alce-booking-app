import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentPointsConfigService } from '../../../services/assessment-points-config.service';
import { ModalComponent } from '../../modal/modal.component';
import { modalInitializer, ModalDto } from '../../modal/modal.dto';

@Component({
  selector: 'app-assessment-min-config',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './assessment-min-config.component.html',
  styleUrl: './assessment-min-config.component.scss'
})
export class AssessmentMinConfigComponent implements OnInit {
  showConfigForm = false;
  minPoints: number | null = null;
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
      },
      error: () => {
        this.showNotification('Error al cargar configuración de refuerzo', true);
      }
    });
  }

  saveMinPointsConfig(): void {
    this.pointsConfigService.update(1, this.maxPoints, this.minPoints!).subscribe({
      next: () => {
        this.showNotification('Nota mínima actualizada correctamente', false, true);
      },
      error: () => {
        this.showNotification('Error al actualizar nota mínima', true);
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