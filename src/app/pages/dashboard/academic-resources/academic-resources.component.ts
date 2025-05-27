import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AssessmentTypeFormComponent } from '../../../components/assessment-types/assessment-type-form/assessment-type-form.component';
import { LinksService } from '../../../services/assessment-types.service';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { AssessmentTypeI } from '../../../services/dtos/assessment-type.dto';
import { AssessmentPointsConfigService } from '../../../services/assessment-points-config.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-academic-resources',
  standalone: true,
  imports: [
      CommonModule,
      FormsModule,
      AssessmentTypeFormComponent,
      ModalComponent
  ],
  templateUrl: './academic-resources.component.html',
  styleUrl: './academic-resources.component.scss'
})
export class AcademicResourcesComponent {
  modal: ModalDto = modalInitializer();
  showConfigForm: boolean = false;
  maxPoints: number | null = null;
  minPoints: number | null = null;

  // assessmentTypes: AssessmentTypeI[] = [];
  assessmentTypes: AssessmentTypeI[] = [
  { name: 'Speaking', description: 'Evaluación hablada con preguntas abiertas' },
  { name: 'Grammar', description: 'Ensayo corto sobre el tema de la unidad' },
];

  constructor(private linksService: LinksService,
              private pointsConfigService: AssessmentPointsConfigService
  ) {}

  ngOnInit(): void {
    // this.loadAssessmentTypes();
     this.loadAssessmentConfig();
  }

  loadAssessmentTypes(): void {
    this.linksService.getAll().subscribe({
      next: (types) => {
        this.assessmentTypes = types;
      },
      error: () => {
        this.showNotification('Error al cargar los tipos de evaluación', true);
      }
    });
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
  
  handleCreateAssessmentType(type: { name: string; description?: string }) {
    this.linksService.create(type).subscribe({
      next: (createdType) => {
        console.log('Tipo creado correctamente:', createdType);
        this.showNotification('Tipo de evaluación creado correctamente', false, true);
      },
      error: () => {
        console.error('Error al crear el tipo de evaluación');
       this.showNotification('Error al crear el tipo de evaluación', true);
      }
    });
  }

  updateAssessmentConfig(): void {
    if (this.maxPoints === null || this.minPoints === null) return;

    this.pointsConfigService.update(1, this.maxPoints, this.minPoints).subscribe({
      next: () => {
        this.showNotification('Configuración de evaluación actualizada correctamente', false, true);
      },
      error: () => {
        this.showNotification('Error al actualizar configuración de evaluación', true);
      }
    });
  }

  showNotification(message: string, isError = false, isSuccess = false) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message,
      isError,
      isSuccess,
      close: () => this.modal.show = false
    };

    setTimeout(() => {
      this.modal.show = false;
    }, 2500);
  }
}
