import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StageAssessmentFilterComponent } from '../../../components/stage-assessment/stage-assessment-filter/stage-assessment-filter.component';
import { StageAssessmentResultsComponent } from "../../../components/stage-assessment/stage-assessment-results/stage-assessment-results.component";
import { StageProgressService } from '../../../services/stage-progress';
import { StageProgressByStage } from '../../../services/dtos/stage-progress.dto';
import { FormsModule } from '@angular/forms';
import { StageAssessmentCreateModalComponent } from '../../../components/stage-assessment/stage-assessment-create-modal/stage-assessment-create-modal.component';
import { StageAssessmentResource } from '../../../services/dtos/stage-resources.dto';
import { StageAssessmentResourcesService } from '../../../services/stage-assessment-resources.service';
import { StageAssessmentService } from '../../../services/stage-assessment.service';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';

@Component({
  selector: 'app-stage-assessment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StageAssessmentFilterComponent,
    StageAssessmentResultsComponent,
    StageAssessmentCreateModalComponent,
    ModalComponent,
  ],
  templateUrl: './stage-assessment.component.html',
  styleUrl: './stage-assessment.component.scss',
})
export class StageAssessmentComponent implements OnInit {

  selectedStageId?: number;
  selectedStudentIds: number[] = [];

  isCreateModalOpen: boolean = false;
  resourcesList: StageAssessmentResource[] = [];
  resetSelectionFlag = false;

  // --- LISTAS ---
  stageProgressList: StageProgressByStage = [];
  filteredList: StageProgressByStage = [];
  pagedList: StageProgressByStage = [];

  // --- PAGINACIÓN ---
  page = 1;
  limit = 20;
  total = 0;

  // --- BUSCADOR ---
  searchTerm: string = "";

  isRecalculating = false;

  @Input() show: boolean = false;
  modal: ModalDto = modalInitializer();

  constructor(private stageProgressService: StageProgressService,
              private stageAssessmentService: StageAssessmentService,
              private stageAssessmentResourcesService: StageAssessmentResourcesService,
  ) {}

  ngOnInit() {}

  // Cuando selecciona un stage
  onStageSelected(stageId: number) {
    this.selectedStageId = stageId;
    this.selectedStudentIds = [];
    this.resetSelectionFlag = true;

    if (!stageId) return;
    this.fetchProgressForStage(stageId);

    this.stageAssessmentResourcesService.getAll({ stageId }).subscribe({
       next: (data) => {
        this.resourcesList = data;
        this.fetchProgressForStage(stageId);
      },
      error: (err) => console.error("Error obteniendo recursos:", err)
    });
  }

   private attachStageEntryDate() {
    if (!this.resourcesList || this.resourcesList.length === 0) return;

    // Unir todos los students de todos los resources
    const allStudentsFromResources = this.resourcesList.flatMap(r => r.students || []);

    this.stageProgressList = this.stageProgressList.map(progress => {
      const match = allStudentsFromResources.find(
        s => s.studentId === progress.studentId
      );

      return {
        ...progress,
        stageEntryDate: match?.stageEntryDate
      };
    });
  }

  // Fetch principal
  private fetchProgressForStage(stageId: number) {
    this.stageProgressService.getProgressForStage(stageId).subscribe({
      next: (data) => {
        this.stageProgressList = data || [];

        this.attachStageEntryDate();

        // inicializar el filtrado con toda la data
        this.filteredList = [...this.stageProgressList];

        this.total = this.filteredList.length;
        this.page = 1;
        this.updatePagedList();
      },
      error: (err) => {
        console.error('Error al obtener progreso por stage:', err);
        this.stageProgressList = [];
        this.filteredList = [];
        this.pagedList = [];
        this.total = 0;
      },
    });
  }

  openCreateAssessmentModal() {
    this.isCreateModalOpen = true;
  }

  onCreateAssessment(payload: any) {
    this.stageAssessmentService.create(payload).subscribe({
      next: () => {
        this.showNotification("Evaluación creada correctamente", false, true);

        // Refrescar lista
        if (this.selectedStageId) {
          this.fetchProgressForStage(this.selectedStageId);
        }

        // Limpiar selección
        this.selectedStudentIds = [];
        this.resetSelectionFlag = true;

        // Cerrar modal
        this.isCreateModalOpen = false;
      },
      error: () => {
        this.showNotification("Error al crear evaluación", true);
      }
    });
  }

  // ==== BUSCADOR ====
  onSearch() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      // restaurar toda la lista
      this.filteredList = [...this.stageProgressList];
    } else {
      this.filteredList = this.stageProgressList.filter(item => {
        const first = item.student.user?.firstName?.toLowerCase() || "";
        const last  = item.student.user?.lastName?.toLowerCase() || "";
        return first.includes(term) || last.includes(term);
      });
    }

    this.total = this.filteredList.length;
    this.page = 1;
    this.updatePagedList();
  }

  onStudentSelection(ids: number[]) {
    this.selectedStudentIds = ids;
    //console.log(ids);
  }

  private executeRecalculation() {
    if (!this.selectedStageId) return;

    this.isRecalculating = true;

    this.stageProgressService.recalculateProgressForStage(this.selectedStageId).subscribe({
      next: () => {
        this.showNotification("Progreso re-calculado correctamente", false, true);

        if (this.selectedStageId) {
          this.fetchProgressForStage(this.selectedStageId);
        }

        this.isRecalculating = false;
      },
      error: () => {
        this.showNotification("Error al re-calcular progreso", true);
        this.isRecalculating = false;
      }
    });

    this.modal.show = false;
  }

  // ==== PAGINACIÓN ====
  updatePagedList() {
    const start = (this.page - 1) * this.limit;
    const end   = start + this.limit;

    this.pagedList = this.filteredList.slice(start, end);
  }

  onPrev() {
    if (this.page > 1) {
      this.page--;
      this.updatePagedList();
    }
  }

  onNext() {
    if (this.page * this.limit < this.total) {
      this.page++;
      this.updatePagedList();
    }
  }

  // Helpers
  get startIndex(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1;
  }

  get endIndex(): number {
    const end = this.page * this.limit;
    return end > this.total ? this.total : end;
  }

  confirmRecalculateProgress() {
    if (!this.selectedStageId) return;

    this.modal = {
      ...modalInitializer(),
      show: true,
      message: "¿Deseas re-calcular el progreso de todos los estudiantes de este stage?",
      isInfo: true,
      showButtons: true,
      close: () => (this.modal.show = false),
      confirm: () => this.executeRecalculation()
    };
  }

  private showNotification(message: string, isError = false, isSuccess = false) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message,
      isError,
      isSuccess,
      isInfo: false,
      close: () => (this.modal.show = false)
    };

    setTimeout(() => {
      this.modal.show = false;
    }, 2000);
  }
}