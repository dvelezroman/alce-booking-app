import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookingService } from '../../../services/booking.service';
import { InstructorEvaluationService } from '../../../services/instructor-evaluation.service';

import { InstructorEvaluation } from '../../../services/dtos/instructor-evaluation.dto';
import { FilterMeetingsDto, MeetingDTO } from '../../../services/dtos/booking.dto';

import { MeetingEvaluationsFiltersComponent } from '../../../components/meeting-evaluations/meeting-evaluations-filters/meeting-evaluations-filters.component';
import { MeetingEvaluationsTableComponent } from '../../../components/meeting-evaluations/meeting-evaluations-table/meeting-evaluations-table.component';
import { MeetingEvaluationDetailModalComponent } from '../../../components/meeting-evaluations/meeting-evaluation-detail-modal/meeting-evaluation-detail-modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { ModalComponent } from "../../../components/modal/modal.component";

@Component({
  selector: 'app-meeting-evaluations',
  standalone: true,
  imports: [
    CommonModule,
    MeetingEvaluationsFiltersComponent,
    MeetingEvaluationsTableComponent,
    MeetingEvaluationDetailModalComponent,
    ModalComponent
],
  templateUrl: './meeting-evaluations.component.html',
  styleUrl: './meeting-evaluations.component.scss'
})
export class MeetingEvaluationsComponent {

  // --------------------
  // DATA
  // --------------------
  meetings: MeetingDTO[] = [];
  selectedEvaluation: InstructorEvaluation | null = null;

  // ERROR
  evaluationErrorMessage: string | null = null;

  // --------------------
  // UI STATE
  // --------------------
  showInstructorColumn = true;
  showStudentColumn = true;

  searchAttempted = false;

  showEvaluationModal = false;

  private scrollPosition = 0;

  modal: ModalDto = modalInitializer();

  constructor(
    private bookingService: BookingService,
    private evaluationService: InstructorEvaluationService
  ) {}

  // ----------------------------------
  // FILTROS DESDE HIJO
  // ----------------------------------
  onFiltersSubmitted(filters: {
    instructorId?: number;
    studentId?: number;
    from?: string;
    to?: string;
  }): void {

    // 🚫 NO BUSCAR SI NO HAY INSTRUCTOR NI ESTUDIANTE
     if (!filters.instructorId && !filters.studentId) {
      this.showAutoCloseModal(
        {
          isInfo: true,
          message: 'Debes seleccionar un instructor o un estudiante'
        },
        3000
      );
      return;
    }

    this.showInstructorColumn = !filters.instructorId;
    this.showStudentColumn = !filters.studentId;

    const params: FilterMeetingsDto = {
      instructorId: filters.instructorId?.toString(),
      studentId: filters.studentId,
      from: filters.from,
      to: filters.to,
      assigned: true
    };

    this.fetchMeetings(params);
  }

  // ----------------------------------
  // FETCH MEETINGS
  // ----------------------------------
  private fetchMeetings(params: FilterMeetingsDto): void {
    this.searchAttempted = true;
    this.meetings = [];
    this.selectedEvaluation = null;

    this.bookingService.searchMeetings(params).subscribe({
      next: (meetings) => {

        this.meetings = meetings.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA; 
        });

      },
      error: () => {
      }
    });
  }

  // ----------------------------------
  // CLICK EN MEETING (DESDE TABLA)
  // ----------------------------------
  onMeetingSelected(meetingId: number): void {
    this.scrollPosition = window.scrollY;
    this.fetchEvaluationByMeeting(meetingId);
  }

  // ----------------------------------
  // FETCH EVALUATION POR MEETING
  // ----------------------------------
  private fetchEvaluationByMeeting(meetingId: number): void {

    this.selectedEvaluation = null;
    this.evaluationErrorMessage = null;

    this.evaluationService.getByMeeting(meetingId).subscribe({
      next: (evaluation) => {
        this.selectedEvaluation = evaluation;
        this.showEvaluationModal = true;

        setTimeout(() => {
          window.scrollTo({ top: this.scrollPosition, behavior: 'auto' });
        });
      },
      error: () => {
        // CUANDO NO TIENE EVALUACIÓN
        this.evaluationErrorMessage = 'Esta clase aún no ha sido evaluada.';
        this.showEvaluationModal = true;

        setTimeout(() => {
          window.scrollTo({ top: this.scrollPosition, behavior: 'auto' });
        });
      }
    });
  }

  // ----------------------------------
  // CLOSE MODAL
  // ----------------------------------
  closeEvaluationModal(): void {
    this.showEvaluationModal = false;
    this.selectedEvaluation = null;
  }

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
}