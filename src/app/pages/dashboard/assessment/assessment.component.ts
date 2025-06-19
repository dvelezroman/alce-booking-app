import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AssessmentTableComponent } from '../../../components/assessment/assessment-table/assessment-table.component';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { AssessementI, AssessmentType, CreateAssessmentI, FilterAssessmentI } from '../../../services/dtos/assessment.dto';
import { AssessmentFormComponent } from '../../../components/assessment/assessment-form/assessment-form.component';
import { AssessmentService } from '../../../services/assessment.service';
import { AssessmentPointsConfigService } from '../../../services/assessment-points-config.service';
import { UserDto } from '../../../services/dtos/user.dto';
import { selectUserData } from '../../../store/user.selector';
import { AssessmentResourceI } from '../../../services/dtos/assessment-resources.dto';
import { AssessmentResourcesService } from '../../../services/assessment-resources.service';


@Component({
  selector: 'app-assessment',
  standalone: true,
  imports: [CommonModule, 
            AssessmentFormComponent, 
            ModalComponent,
            AssessmentTableComponent
          ],
  templateUrl: './assessment.component.html',
  styleUrl: './assessment.component.scss',
})
export class AssessmentComponent implements OnInit {
  modal: ModalDto = modalInitializer();
  assessments: AssessementI[] = [];
  blockedTypes: AssessmentType[] = [];
  resources: AssessmentResourceI[] = [];
  instructorId: number | null = null;
  currentStageId: number | null = null;
  minPointsAssessment: number | null = null;
  hasSearched: boolean = false;

  constructor(
    private store: Store,
    private assessmentService: AssessmentService,
    private assessmentResourcesService: AssessmentResourcesService,
    private assessmentPointsConfigService: AssessmentPointsConfigService
  ) {}

  ngOnInit(): void {
    this.loadAssessmentConfig();
    this.loadResources();

    this.store.select(selectUserData).subscribe((user: UserDto | null) => {
      if (user?.instructor?.id) {
        this.instructorId = user.instructor.id;
      }
    });
  }

  loadAssessmentConfig(): void {
    this.assessmentPointsConfigService.getById().subscribe({
      next: (config) => {
        this.minPointsAssessment = config.minPointsAssessment;
      },
      error: () => {
        this.showModal(
          this.createModalParams(true, 'Error al cargar la configuración de evaluación.')
        );
      }
    });
  }

  loadResources(): void {
    this.assessmentResourcesService.getAll().subscribe({
      next: (resources) => {
        this.resources = resources;
      },
      error: () => {
        this.showModal(
          this.createModalParams(true, 'Error al cargar los recursos de refuerzo.')
        );
      }
    });
  }

  get transformedResources() {
    return this.resources.map(resource => ({
      id: resource.id,
      name: resource.title,
      content: resource.link,
    }));
  }

  handleAssessmentCreated(payload: CreateAssessmentI): void {
    // console.log('Payload a enviar:', payload);
    this.assessmentService.create(payload).subscribe({
      next: (response) => {
        //console.log('Respuesta del backend:', response); 
        this.showModal(
          this.createModalParams(false, 'Evaluación registrada correctamente.')
        );
        this.currentStageId = payload.stageId;
        this.fetchAssessments(payload.studentId.toString());
        if (response.updatedStage === true) {
        this.showStagePromotionModal();
      }
      },
      error: () => {
        this.showModal(
          this.createModalParams(true, 'Error al registrar la evaluación.')
        );
      },
    });
  }

  fetchAssessments(studentId: string) {
    this.hasSearched = true;
    const params: FilterAssessmentI = {
      studentId,
      // stageId,
    };

    this.assessmentService.findAll(params).subscribe({
      next: (result) => {
       // console.log('Evaluaciones del estudiante:', result);
        this.assessments = result;
        this.evaluateBlockedTypes(); 
      },
      error: () => {
        this.showModal(
          this.createModalParams(true, 'Error al obtener las evaluaciones.')
        );
      }
    });
  }

  evaluateBlockedTypes(): void {
    this.blockedTypes = [];
    if (this.minPointsAssessment === null) return;

    const groupedByType: Record<string, number[]> = {};

    for (const a of this.assessments) {
      if (a.stageId !== this.currentStageId) continue;

      if (!groupedByType[a.type]) {
        groupedByType[a.type] = [];
      }

      groupedByType[a.type].push(a.points);
    }

    for (const type in groupedByType) {
      const isApproved = groupedByType[type].some(p => p >= this.minPointsAssessment!);
      if (isApproved) {
        this.blockedTypes.push(type as AssessmentType);
      }
    }
  }

  private showStagePromotionModal(): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      isContentViewer: true,
      title: '¡Stage aprobado!',
      message: 'El estudiante ha aprobado su etapa y ha sido promovido al siguiente stage.',
      close: this.closeModal
    };
  }

  showModal(params: ModalDto): void {
    this.modal = { ...params };
    setTimeout(() => {
      this.modal.close();
    }, 2500);
  }

  closeModal = () => {
    this.modal = { ...modalInitializer() };
  };

  createModalParams(isError: boolean, message: string): ModalDto {
    return {
      ...this.modal,
      show: true,
      isError,
      isSuccess: !isError,
      message,
      close: this.closeModal,
    };
  }
}
