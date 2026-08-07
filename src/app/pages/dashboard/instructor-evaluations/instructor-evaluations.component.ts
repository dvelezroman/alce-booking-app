import {
  Component,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  InstructorEvaluation,
  PendingMeetingEvaluation
} from '../../../services/dtos/instructor-evaluation.dto';

import {
  ModalDto,
  modalInitializer
} from '../../../components/modal/modal.dto';

import {
  InstructorEvaluationService
} from '../../../services/instructor-evaluation.service';

import {
  UsersService
} from '../../../services/users.service';

import {
  ModalComponent
} from '../../../components/modal/modal.component';

import {
  InstructorEvaluationHeaderComponent
} from '../../../components/instructor-evaluations/instructor-evaluation-header/instructor-evaluation-header.component';

import {
  EvaluationSupportComponent
} from '../../../components/instructor-evaluations/evaluation-support/evaluation-support.component';

import {
  EvaluationTabsComponent
} from '../../../components/instructor-evaluations/evaluation-tabs/evaluation-tabs.component';

import {
  CompletedEvaluationsComponent
} from '../../../components/instructor-evaluations/completed-evaluations/completed-evaluations.component';

import {
  PendingEvaluationsComponent
} from '../../../components/instructor-evaluations/pending-evaluations/pending-evaluations.component';

import {
  EvaluateInstructorModalComponent
} from '../../../components/instructor-evaluations/evaluate-instructor-modal/evaluate-instructor-modal.component';

@Component({
  selector: 'app-instructor-evaluations',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    InstructorEvaluationHeaderComponent,
    EvaluationSupportComponent,
    EvaluationTabsComponent,
    CompletedEvaluationsComponent,
    EvaluateInstructorModalComponent,
    PendingEvaluationsComponent
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

  selectedMeeting:
    PendingMeetingEvaluation | null = null;

  activeTab:
    'pending' | 'completed' = 'pending';

  modal: ModalDto = modalInitializer();

  constructor(
    private instructorEvaluationService:
      InstructorEvaluationService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.loadPendingEvaluations();
    this.loadCompletedEvaluations();
  }

  get pendingCount(): number {
    return this.pendingMeetings.length;
  }

  get completedCount(): number {
    return this.completedEvaluations.length;
  }

  get isLoading(): boolean {
    return (
      this.loadingPending ||
      this.loadingCompleted
    );
  }

  get hasPendingEvaluations(): boolean {
    return this.pendingMeetings.length > 0;
  }

  get hasCompletedEvaluations(): boolean {
    return this.completedEvaluations.length > 0;
  }

  private showAutoCloseModal(
    config: Partial<ModalDto>,
    duration = 3000
  ): void {
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
          this.pendingMeetings = [];
          this.loadingPending = false;
        }
      });
  }

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
          this.completedEvaluations = [];
          this.loadingCompleted = false;
        }
      });
  }

  onTabChange(
    tab: 'pending' | 'completed'
  ): void {
    this.activeTab = tab;
  }

  onEvaluate(
    meeting: PendingMeetingEvaluation
  ): void {
    this.selectedMeeting = meeting;
    this.showEvaluationModal = true;
  }

  closeEvaluationModal(): void {
    this.selectedMeeting = null;
    this.showEvaluationModal = false;
  }

  onSubmitEvaluation(
    data: {
      rating: number;
      observation?: string;
    }
  ): void {
    if (!this.selectedMeeting) {
      return;
    }

    this.instructorEvaluationService
      .create(
        this.selectedMeeting.id,
        data
      )
      .subscribe({
        next: () => {
          this.showEvaluationModal = false;
          this.selectedMeeting = null;

          this.loadPendingEvaluations();
          this.loadCompletedEvaluations();

          this.usersService
            .refreshLogin()
            .subscribe();

          this.showAutoCloseModal(
            {
              isSuccess: true,
              message:
                'Evaluación enviada correctamente'
            },
            1000
          );
        },
        error: () => {
          this.showAutoCloseModal(
            {
              isError: true,
              message:
                'Error al enviar la evaluación'
            },
            2000
          );
        }
      });
  }

  onViewCompletedEvaluation(
    evaluation: InstructorEvaluation
  ): void {
    console.log(
      'Ver evaluación realizada:',
      evaluation
    );
  }

  onContactSupport(): void {
    console.log('Contactar soporte');
  }
}