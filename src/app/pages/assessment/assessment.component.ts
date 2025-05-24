import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AssessmentFormComponent } from '../../components/assessment/assessment-form/assessment-form.component';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../store/user.selector';
import { UserDto } from '../../services/dtos/user.dto';
import { AssessmentService } from '../../services/assessment.service';
import { AssessmentPointsConfigService } from '../../services/assessment-points-config.service';
import { AssessementI, AssessmentType, CreateAssessmentI, FilterAssessmentI } from '../../services/dtos/assessment.dto';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { ModalComponent } from '../../components/modal/modal.component';
import { AssessmentTableComponent } from '../../components/assessment/assessment-table/assessment-table.component';

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
  instructorId: number | null = null;
  assessments: AssessementI[] = [];
  maxPointsAssessment: number | null = null;
  blockedTypes: AssessmentType[] = [];
  hasSearched: boolean = false;

  constructor(
    private store: Store,
    private assessmentService: AssessmentService,
    private assessmentPointsConfigService: AssessmentPointsConfigService
  ) {}

  ngOnInit(): void {
    this.loadAssessmentConfig();

    this.store.select(selectUserData).subscribe((user: UserDto | null) => {
      if (user?.instructor?.id) {
        this.instructorId = user.instructor.id;
      }
    });
  }

  loadAssessmentConfig(): void {
    this.assessmentPointsConfigService.getById().subscribe({
      next: (config) => {
        this.maxPointsAssessment = config.maxPointsAssessment;
      },
      error: () => {
        this.showModal(
          this.createModalParams(true, 'Error al cargar la configuración de evaluación.')
        );
      }
    });
  }

  handleAssessmentCreated(payload: CreateAssessmentI): void {
    this.assessmentService.create(payload).subscribe({
      next: () => {
        this.showModal(
          this.createModalParams(false, 'Evaluación registrada correctamente.')
        );
        this.fetchAssessments( payload.studentId.toString(),payload.stageId.toString());
      },
      error: () => {
        this.showModal(
          this.createModalParams(true, 'Error al registrar la evaluación.')
        );
      },
    });
  }

  fetchAssessments(studentId: string, stageId: string) {
    this.hasSearched = true;
    const params: FilterAssessmentI = {
      studentId,
      stageId,
    };

    this.assessmentService.findAll(params).subscribe({
      next: (result) => {
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

    if (this.maxPointsAssessment === null) return;

    const groupedByType: Record<string, number[]> = {};

    for (const a of this.assessments) {
      if (!groupedByType[a.type]) {
        groupedByType[a.type] = [];
      }
      groupedByType[a.type].push(a.points);
    }

    for (const type in groupedByType) {
      const hasMax = groupedByType[type].some(p => p >= this.maxPointsAssessment!);
      if (hasMax) {
        this.blockedTypes.push(type as AssessmentType);
      }
    }
    //console.log('evaluaciones bloqueadas:', this.blockedTypes);
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
