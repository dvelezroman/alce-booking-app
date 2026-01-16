import { Component, OnInit } from '@angular/core';
import { InstructorEvaluation, PendingMeetingEvaluation } from '../../../services/dtos/instructor-evaluation.dto';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { InstructorEvaluationService } from '../../../services/instructor-evaluation.service';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../components/modal/modal.component';
import { CompletedEvaluationsComponent } from "../../../components/instructor-evaluations/completed-evaluations/completed-evaluations.component";
import { PendingEvaluationsComponent } from "../../../components/instructor-evaluations/pending-evaluations/pending-evaluations.component";
import { EvaluateInstructorModalComponent } from "../../../components/instructor-evaluations/evaluate-instructor-modal/evaluate-instructor-modal.component";

@Component({
  selector: 'app-instructor-evaluations',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    CompletedEvaluationsComponent,
    PendingEvaluationsComponent,
    EvaluateInstructorModalComponent
  ],
  templateUrl: './instructor-evaluations.component.html',
  styleUrl: './instructor-evaluations.component.scss'
})
export class InstructorEvaluationsComponent implements OnInit {

  pendingMeetings: PendingMeetingEvaluation[] = [];
  completedEvaluations: InstructorEvaluation[] = [];

  loadingPending = false;
  loadingCompleted = false;

  showEvaluationModal = false;
  selectedMeeting: PendingMeetingEvaluation | null = null;

  modal: ModalDto = modalInitializer();

  constructor(
    private instructorEvaluationService: InstructorEvaluationService
  ) {}

  ngOnInit(): void {
    this.loadPendingEvaluations();
    this.loadCompletedEvaluations();
  }

  // ----------------------------------
  // HELPER (CIERRA SOLO EL MODAL)
  // ----------------------------------
  private showAutoCloseModal(
    config: Partial<ModalDto>,
    duration = 3000
  ) {
    this.modal = {
      ...modalInitializer(),
      ...config,
      show: true,
      close: () => {
        this.modal.show = false;
      }
    };

    setTimeout(() => {
      this.modal.show = false;
    }, duration);
  }

  // ----------------------------------
  // FETCH PENDIENTES
  // ----------------------------------
  private loadPendingEvaluations(): void {
    this.loadingPending = true;

    this.instructorEvaluationService
      .getPendingEvaluations(50, 0)
      .subscribe({
        next: (data) => {
          this.pendingMeetings = data;
          this.loadingPending = false;
        },
        error: () => {
          this.loadingPending = false;
        }
      });
  }

  // ----------------------------------
  // FETCH EVALUADAS
  // ----------------------------------
  private loadCompletedEvaluations(): void {
    this.loadingCompleted = true;

    this.instructorEvaluationService
      .getMyEvaluations(50, 0)
      .subscribe({
        next: (data) => {
          this.completedEvaluations = data;
          this.loadingCompleted = false;
        },
        error: () => {
          this.loadingCompleted = false;
        }
      });
  }

  // ----------------------------------
  // SUBMIT EVALUACIÓN
  // ----------------------------------
  onSubmitEvaluation(data: { rating: number; observation?: string }) {
    if (!this.selectedMeeting) return;

    this.instructorEvaluationService
      .create(this.selectedMeeting.id, data)
      .subscribe({
        next: () => {
          this.showEvaluationModal = false;
          this.selectedMeeting = null;

          this.loadPendingEvaluations();
          this.loadCompletedEvaluations();

          this.showAutoCloseModal(
            {
              isSuccess: true,
              message: 'Evaluación enviada correctamente'
            },
            3000
          );
        },
        error: () => {
          this.showAutoCloseModal(
            {
              isError: true,
              message: 'Error al enviar la evaluación'
            },
            4000
          );
        }
      });
  }

  // ----------------------------------
  // ABRIR / CERRAR MODAL EVALUACIÓN
  // ----------------------------------
  onEvaluate(meeting: PendingMeetingEvaluation): void {
    this.selectedMeeting = meeting;
    this.showEvaluationModal = true;
  }

  closeEvaluationModal(): void {
    this.selectedMeeting = null;
    this.showEvaluationModal = false;
  }
}