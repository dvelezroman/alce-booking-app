import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';

import { ContentSelectorComponent } from '../../../components/contenido/content-selector/content-selector.component';
import { StudentContentHistoryModalComponent } from '../../../components/contenido/student-content-history-modal/student-content-history-modal.component';

import { EvaluationModalComponent } from '../../../components/instructor/evaluation-modal/evaluation-modal.component';
import { AssistanceNoteModalComponent } from '../../../components/instructor/assistance-note-modal/assistance-note-modal.component';

import { ModalComponent } from '../../../components/modal/modal.component';
import {
  ModalDto,
  modalInitializer,
} from '../../../components/modal/modal.dto';

/* =========================
   NUEVOS COMPONENTES V2
========================= */

import { InstructorMeetingsHeaderComponent } from '../../../components/instructor-meetings/instructor-meetings-header/instructor-meetings-header.component';
import { InstructorMeetingsFiltersComponent } from '../../../components/instructor-meetings/instructor-meetings-filters/instructor-meetings-filters.component';
import { InstructorMeetingsListComponent } from '../../../components/instructor-meetings/instructor-meetings-list/instructor-meetings-list.component';
import { InstructorMeetingRowComponent } from '../../../components/instructor-meetings/instructor-meeting-row/instructor-meeting-row.component';
import { InstructorMeetingsPaginationComponent } from '../../../components/instructor-meetings/instructor-meetings-pagination/instructor-meetings-pagination.component';
import { InstructorMeetingsIconGuideComponent } from '../../../components/instructor-meetings/instructor-meetings-icon-guide/instructor-meetings-icon-guide.component';
import { InstructorContentPreparationPanelComponent } from '../../../components/instructor-meetings/instructor-content-preparation-panel/instructor-content-preparation-panel.component';

/* =========================
   SERVICES
========================= */

import { BookingService } from '../../../services/booking.service';
import { StagesService } from '../../../services/stages.service';
import { StudyContentService } from '../../../services/study-content.service';
import { AssessmentService } from '../../../services/assessment.service';
import { AssessmentPointsConfigService } from '../../../services/assessment-points-config.service';

/* =========================
   DTO
========================= */

import {
  MeetingDTO,
  FilterMeetingsDto,
  CreateMeetingDto,
} from '../../../services/dtos/booking.dto';
import { Stage } from '../../../services/dtos/student.dto';
import {
  StudyContentDto,
  StudyContentPayloadI,
} from '../../../services/dtos/study-content.dto';
import { UserDto } from '../../../services/dtos/user.dto';
import { AssessmentResourceI } from '../../../services/dtos/assessment-resources.dto';
import { AssessementI } from '../../../services/dtos/assessment.dto';

/* =========================
   STORE
========================= */

import {
  selectUserData,
  selectInstructorLink,
} from '../../../store/user.selector';

/* =========================
   UTILS
========================= */

import { getHttpErrorMessage } from '../../../shared/utils/http-error-message.util';
import { CreateMeetingModalComponent } from '../../../components/instructor/create-meeting/create-meeting-modal.component';

@Component({
  selector: 'app-searching-meeting-instructor-v2',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,

    /* MODALES / COMPONENTES EXISTENTES */
    CreateMeetingModalComponent,
    ModalComponent,
    StudentContentHistoryModalComponent,
    EvaluationModalComponent,
    AssistanceNoteModalComponent,

    /* NUEVOS COMPONENTES */
    InstructorMeetingsHeaderComponent,
    InstructorMeetingsFiltersComponent,
    InstructorMeetingsListComponent,
    InstructorMeetingsPaginationComponent,
    InstructorMeetingsIconGuideComponent,
    InstructorContentPreparationPanelComponent,
  ],
  templateUrl: './searching-meeting-instructor-v2.component.html',
  styleUrl: './searching-meeting-instructor-v2.component.scss',
})
export class SearchingMeetingInstructorV2Component implements OnInit {

  /* =========================
     MEETING SELECCIONADA
  ========================= */
  selectedMeeting?: MeetingDTO;

  /* =========================
     DATA PRINCIPAL
  ========================= */
  stages: Stage[] = [];
  meetings: MeetingDTO[] = [];
  filteredStages: Stage[] = [];
  instructors: UserDto[] = [];
  availableHours: number[] = [];
  studyContentIds: number[] = [];
  studentStageContents: StudyContentDto[] = [];
  studentContentHistory: StudyContentPayloadI[] = [];
  ageGroupOptions: string[] = [
    'KIDS',
    'TEENS',
    'ADULTS',
  ];

  studyContentOptions: {
    id: number;
    name: string;
  }[] = [];

  /* =========================
     STAGES / ASSESSMENTS
  ========================= */
  currentStageIndex: number = 0;
  minPoints: number = 0;

  /* =========================
     USUARIO / INSTRUCTOR
  ========================= */
  userId: number | null = null;
  instructorId: number | null = null;
  instructorLink: string | null = null;

  /* =========================
     UI
  ========================= */
  showForm: boolean = true;
  showCreateModal: boolean = false;
  isLoadingContentHistory: boolean = false;
  isStudentContentHistoryModalVisible: boolean = false;

  /* =========================
     NUEVA UI V2
  ========================= */

  isLoadingMeetings: boolean = false;
  showContentPreparationPanel: boolean = false;
  private initialMeetingsLoaded: boolean = false;

  /* =========================
     PAGINACIÓN FRONTEND
  ========================= */
  currentPage: number = 1;
  pageSize: number = 20;

  /* =========================
     EVALUACIONES
  ========================= */
  assessmentsByStudent: AssessementI[] = [];
  showEvaluationModal: boolean = false;
  highlightStageId: number | null = null;

  /* =========================
     MODALES
  ========================= */
  modal: ModalDto = modalInitializer();
  confirmationModal: ModalDto = modalInitializer();

  /* =========================
     ASISTENCIA
  ========================= */
  showAssistanceNoteModal = false;
  selectedMeetingForAssistance?: MeetingDTO;

  /* =========================
     STEPS CONTENIDO
  ========================= */

  stepState = {
    stageSelected: false,
    topicsSelected: false,
    confirmed: false,
  };

  /* =========================
     FILTROS
  ========================= */

  filter: FilterMeetingsDto = {
    from: '',
    to: '',
    hour: '',
    assigned: true,
    category: undefined,
    mode: undefined,
  };

  constructor(
    private store: Store,
    private sanitizer: DomSanitizer,
    private stagesService: StagesService,
    private bookingService: BookingService,
    private studyContentService: StudyContentService,
    private assessmentService: AssessmentService,
    private pointsConfigService: AssessmentPointsConfigService,
  ) {}

  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.filter.category = undefined;
    this.filter.mode = undefined;

    /*
     * La página V2 inicia mostrando únicamente
     * las reuniones de la semana actual.
     */
    this.initializeCurrentWeekFilter();

    this.loadStagesWithContent();

    this.loadAssessmentConfig();

    this.stagesService.getAll().subscribe(response => {
        this.stages = this.sortStages(response);
        this.filter.stageId = '';
      });

    this.availableHours = Array.from({ length: 13 }, (_, i) => 8 + i);

    /*
     * Esperamos a tener el instructorId
     * antes de realizar el primer fetch.
     */
    this.store
      .select(selectUserData)
      .subscribe((userData: UserDto | null) => {
        if (!userData) {
          return;
        }

        this.userId = userData.id;

        if (userData.instructor) {
          this.instructorId = userData.instructor.id;
        }

        if (
          this.instructorId &&
          !this.initialMeetingsLoaded
        ) {
          this.initialMeetingsLoaded = true;

          this.fetchMeetings(this.filter);
        }
      });

    this.store.select(selectInstructorLink).subscribe(link => { this.instructorLink = link });
  }


  isNewUser( meeting: MeetingDTO ): boolean {
    return !!meeting.isNewUser;
  }

  /* =========================
     SEMANA ACTUAL
  ========================= */

  private initializeCurrentWeekFilter(): void {
    const now = DateTime
      .now()
      .setZone('America/Guayaquil');

    const today = now.toISODate();

    const threeDaysLater = now
      .plus({ days: 1 })
      .toISODate();

    this.filter = {
      ...this.filter,
      from: today ?? '',
      to: threeDaysLater ?? '',
      assigned: true,
    };
  }

  /* =========================
     PANEL PREPARAR ASISTENCIA
  ========================= */

  openContentPreparationPanel(): void {
    this.showContentPreparationPanel = true;
  }

  closeContentPreparationPanel(): void {
    this.showContentPreparationPanel = false;
  }

  toggleContentPreparationPanel(): void {
    this.showContentPreparationPanel =
      !this.showContentPreparationPanel;
  }

  /* =========================
     STEP STATE
  ========================= */

  onStepStateChanged(state: any): void {
    this.stepState = state;
  }

  /* =========================
     CONFIG ASSESSMENT
  ========================= */

  loadAssessmentConfig(): void {
    this.pointsConfigService
      .getById()
      .subscribe(config => {
        this.minPoints =
          config.minPointsAssessment;
      });
  }

  /* =========================
     STAGES
  ========================= */

  private loadStagesWithContent(): void {
    this.stagesService
      .getAll()
      .subscribe(allStages => {
        const stagesWithContent: Stage[] = [];

        let processedCount = 0;

        /*
         * Evitamos que el flujo quede esperando
         * si no existen stages.
         */
        if (allStages.length === 0) {
          this.handleStagesLoaded([], []);
          return;
        }

        allStages.forEach(stage => {
          this.studyContentService
            .filterBy(stage.id)
            .subscribe({
              next: contents => {
                if (contents.length > 0) {
                  stagesWithContent.push(stage);
                }

                processedCount++;

                if (
                  processedCount ===
                  allStages.length
                ) {
                  this.handleStagesLoaded(
                    allStages,
                    stagesWithContent,
                  );
                }
              },
              error: () => {
                processedCount++;

                if (
                  processedCount ===
                  allStages.length
                ) {
                  this.handleStagesLoaded(
                    allStages,
                    stagesWithContent,
                  );
                }
              },
            });
        });
      });
  }

  private handleStagesLoaded(
    allStages: Stage[],
    stagesWithContent: Stage[],
  ): void {
    this.filteredStages =
      this.sortStages(stagesWithContent);

    this.stages =
      this.sortStages(allStages);

    this.filter.stageId = '';
  }

  private sortStages(
    stages: Stage[],
  ): Stage[] {
    return [...stages].sort(
      (a, b) =>
        this.extractStageNumber(a.number) -
        this.extractStageNumber(b.number),
    );
  }

  private extractStageNumber(
    stageLabel: string,
  ): number {
    return (
      parseFloat(
        stageLabel.replace(/[^0-9.]/g, ''),
      ) || 0
    );
  }

  /* =========================
     FECHA
  ========================= */

  isToday(
    date: Date | string,
  ): boolean {
    if (!date) {
      return false;
    }

    const today = DateTime
      .now()
      .setZone('America/Guayaquil')
      .startOf('day');

    const meetingDate =
      typeof date === 'string'
        ? DateTime
            .fromISO(
              date,
              {
                zone: 'America/Guayaquil',
              },
            )
            .startOf('day')
        : DateTime
            .fromJSDate(
              date,
              {
                zone: 'America/Guayaquil',
              },
            )
            .startOf('day');

    return (
      today.toISODate() ===
      meetingDate.toISODate()
    );
  }

  /* =========================
     FILTROS
  ========================= */

  onFilterChange(): void {
    this.clearSelectedContents();

    this.currentPage = 1;

    const filterParams: FilterMeetingsDto = {
      ...this.filter,

      hour:
        this.filter.hour
          ? this.filter.hour.toString()
          : undefined,

      category:
        this.filter.category || undefined,

      mode:
        this.filter.mode || undefined,

      stageId:
        this.filter.stageId || undefined,
    };

    Object
      .keys(filterParams)
      .forEach(key => {
        if (
          filterParams[
            key as keyof FilterMeetingsDto
          ] === undefined
        ) {
          delete (filterParams as any)[key];
        }
      });

    this.fetchMeetings(filterParams);
  }

  /* =========================
     LIMPIAR FILTROS
  ========================= */

  clearFilters(): void {
    this.initializeCurrentWeekFilter();
    this.filter.hour = '';
    this.filter.stageId = '';
    this.filter.category = undefined;
    this.filter.mode = undefined;
    this.filter.assigned = true;
    this.clearSelectedContents();
    this.currentPage = 1;
    this.fetchMeetings(this.filter);
  }

  /* =========================
     ACTUALIZAR MEETINGS
  ========================= */

  refreshMeetings(): void {
    this.fetchMeetings(this.filter);
  }

  /* =========================
     FETCH MEETINGS
  ========================= */

  private fetchMeetings(
    params?: FilterMeetingsDto,
  ): void {
    if (!this.instructorId) {
      return;
    }

    const searchParams: FilterMeetingsDto = {
      ...params,
      instructorId: this.instructorId.toString(),
    };

    this.isLoadingMeetings = true;

    this.bookingService
      .searchMeetings(searchParams)
      .subscribe({
        next: meetings => {
          this.meetings = this.sortMeetingsByNewest(meetings);

          this.currentPage = 1;
          this.isLoadingMeetings = false;
        },

        error: () => {
          this.meetings = [];
          this.currentPage = 1;
          this.isLoadingMeetings = false;

          this.showModal(
            this.createModalParams(
              true,
              'Error al cargar las clases.',
            ),
          );
        },
      });
  }

  private sortMeetingsByNewest(
    meetings: MeetingDTO[],
  ): MeetingDTO[] {
    return [...meetings].sort((a, b) => {
      const dateA = DateTime
        .fromISO(String(a.localdate))
        .set({
          hour: Number(a.localhour ?? a.hour ?? 0),
          minute: 0,
          second: 0,
        })
        .setZone('America/Guayaquil');

      const dateB = DateTime
        .fromISO(String(b.localdate))
        .set({
          hour: Number(b.localhour ?? b.hour ?? 0),
          minute: 0,
          second: 0,
        })
        .setZone('America/Guayaquil');

      return dateB.toMillis() - dateA.toMillis();
    });
  }

  /* =========================
     PAGINACIÓN FRONTEND
  ========================= */

  get totalMeetings(): number {
    return this.meetings.length;
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(
        this.totalMeetings /
          this.pageSize,
      ),
    );
  }

  get paginatedMeetings(): MeetingDTO[] {
    const start =
      (this.currentPage - 1) *
      this.pageSize;

    const end =
      start + this.pageSize;

    return this.meetings.slice(
      start,
      end,
    );
  }

  get paginationStart(): number {
    if (
      this.totalMeetings === 0
    ) {
      return 0;
    }

    return (
      (this.currentPage - 1) *
        this.pageSize +
      1
    );
  }

  get paginationEnd(): number {
    return Math.min(
      this.currentPage *
        this.pageSize,
      this.totalMeetings,
    );
  }

  onPageChange(
    page: number,
  ): void {
    if (
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.currentPage = page;
  }

  /* =========================
     ASISTENCIA
  ========================= */

  onAssistanceCheckboxClick(
    event: Event,
    meeting: MeetingDTO,
  ): void {
    event.preventDefault();

    this.confirmAssistanceWithContentCheck(
      meeting,
    );
  }

  confirmAssistanceWithContentCheck(
    meeting: MeetingDTO,
  ): void {
    const isCancellingAssistance =
      meeting.present;

    if (isCancellingAssistance) {
      this.confirmationModal = {
        ...modalInitializer(),

        show: true,

        isInfo: true,

        message:
          '¿Estás seguro de cancelar la asistencia?<br>Si cancelas la asistencia también se eliminará el contenido, si lo hubiere.',

        showButtons: true,

        confirm: () => {
          this.toggleSelection(meeting);

          this.closeConfirmationModal();
        },

        close:
          this.closeConfirmationModal,
      };

      return;
    }

    if (
      this.studyContentIds.length === 0
    ) {
      this.showModal(
        this.createModalParams(
          true,
          'Para marcar asistencia debes agregar al menos un contenido para la clase.',
        ),
      );

      return;
    }

    this.askForAssistanceNote(
      meeting,
    );
  }

  toggleSelection(
    meeting: MeetingDTO,
  ): void {
    if (
      meeting &&
      meeting.id
    ) {
      const updatedPresence =
        !meeting.present;

      this.bookingService
        .updateAssistance(
          meeting.id,
          !meeting.present,
          this.studyContentIds,
        )
        .subscribe({
          next: () => {
            const filterParams:
              FilterMeetingsDto = {
                ...this.filter,
              };

            this.fetchMeetings(
              filterParams,
            );

            const messageText =
              updatedPresence
                ? 'Presente'
                : 'Ausente';

            /*
            this.showModal(
              this.createModalParams(
                false,
                `Asistencia actualizada: ${messageText}`,
              ),
            );
            */
          },

          error: () => {
            this.showModal(
              this.createModalParams(
                true,
                'Error al actualizar la asistencia',
              ),
            );
          },
        });
    }
  }

  private askForAssistanceNote(
    meeting: MeetingDTO,
  ): void {
    this.confirmationModal = {
      ...modalInitializer(),

      show: true,

      isInfo: true,

      message:
        '¿Desea agregar una nota sobre el comportamiento del estudiante?',

      showButtons: true,

      confirm: () => {
        this.selectedMeetingForAssistance =
          meeting;

        this.showAssistanceNoteModal =
          true;

        this.closeConfirmationModal();
      },

      close: () => {
        this.toggleSelection(
          meeting,
        );

        this.closeConfirmationModal();
      },
    };
  }

  handleAssistanceNoteCancel(): void {
    this.showAssistanceNoteModal =
      false;

    this.selectedMeetingForAssistance =
      undefined;
  }

  onAssistanceNoteSaved(
    note: string,
  ): void {
    if (
      !this.selectedMeetingForAssistance
    ) {
      return;
    }

    const meeting =
      this.selectedMeetingForAssistance;

    this.bookingService
      .updateAssistance(
        meeting.id!,
        true,
        this.studyContentIds,
        note || undefined,
      )
      .subscribe({
        next: () => {
          this.fetchMeetings(
            this.filter,
          );

          this.showAssistanceNoteModal =
            false;

          this.selectedMeetingForAssistance =
            undefined;
        },

        error: () => {
          this.showModal(
            this.createModalParams(
              true,
              'Error al actualizar asistencia',
            ),
          );

          this.showAssistanceNoteModal =
            false;

          this.selectedMeetingForAssistance =
            undefined;
        },
      });
  }

  /* =========================
     MEETING PASADA
  ========================= */

  hasMeetingPassed(
    localdate: string | Date,
    hour: number,
  ): boolean {
    if (
      !localdate ||
      hour === undefined
    ) {
      return false;
    }

    const meetingDateTime =
      DateTime
        .fromISO(
          String(localdate),
        )
        .set({
          hour,
          minute: 0,
        })
        .setZone(
          'America/Guayaquil',
        );

    const now = DateTime
      .now()
      .setZone(
        'America/Guayaquil',
      );

    return now > meetingDateTime;
  }

  /* =========================
     CREAR MEETING
  ========================= */

  onCreateMeeting(): void {
    this.showCreateModal = true;
  }

  handleMeetingCreated(
    meeting: CreateMeetingDto,
  ): void {
    const isOnline =
      meeting.mode === 'ONLINE';

    if (
      isOnline &&
      !this.instructorLink
    ) {
      this.showModal(
        this.createModalParams(
          true,
          'No puedes crear una clase ONLINE porque no tienes un link asignado.',
        ),
      );

      return;
    }

    const meetingWithInstructorInfo:
      CreateMeetingDto = {
        ...meeting,

        link:
          isOnline
            ? this.instructorLink ??
              undefined
            : undefined,

        password:
          isOnline &&
          this.instructorId
            ? this.instructorId.toString()
            : undefined,

        assignedBy:
          this.userId ?? undefined,

        createdByInstructor: true,
      };

    this.bookingService
      .bookMeeting(
        meetingWithInstructorInfo,
      )
      .subscribe({
        next: () => {
          this.showCreateModal =
            false;

          this.showModal(
            this.createModalParams(
              false,
              'Clase creada exitosamente.',
            ),
          );

          this.fetchMeetings(
            this.filter,
          );
        },

        error: error => {
          const msg =
            getHttpErrorMessage(
              error,
              'No se pudo crear la clase',
            );

          this.showModal(
            this.createModalParams(
              true,
              msg,
            ),
          );

          this.showCreateModal =
            false;
        },
      });
  }

  /* =========================
     CONTENIDOS SELECCIONADOS
  ========================= */

  onContentIdsSelected(
    ids: number[],
  ): void {
    this.studyContentIds = [
      ...new Set([
        ...this.studyContentIds,
        ...ids,
      ]),
    ];

    this.loadContentNames(
      this.studyContentIds,
    );
  }

  loadContentNames(
    contentIds: number[],
  ): void {
    if (
      contentIds.length === 0
    ) {
      this.studyContentOptions = [];

      return;
    }

    this.studyContentService
      .getManyStudyContents(
        contentIds,
      )
      .subscribe(contents => {
        this.studyContentOptions =
          contents.map(c => ({
            id: c.id,

            name:
              `Stage ${
                c.stage?.number ||
                c.stageId
              }, ${c.title}`,
          }));
      });
  }

  /* =========================
     CONTENIDO POR STAGE
  ========================= */

  loadStageContents(
    stageId: number,
  ): void {
    this.studyContentService
      .filterBy(stageId)
      .subscribe({
        next: contents => {
          const validContents =
            contents.filter(
              c =>
                typeof c.unit ===
                  'number' &&
                c.unit > 0,
            );

          this.studentStageContents =
            validContents;
        },

        error: () => {
          this.showModal(
            this.createModalParams(
              true,
              'Error al cargar los contenidos del stage.',
            ),
          );
        },
      });
  }

  /* =========================
     FORMAT CONTENT
  ========================= */

  formatStudyContent(
    meeting: MeetingDTO,
  ): string {
    if (
      !meeting.studyContent ||
      meeting.studyContent.length === 0
    ) {
      return 'Sin contenido';
    }

    return meeting.studyContent
      .map(c => `${c.title}`)
      .join('\n');
  }

  /* =========================
     LIMPIAR CONTENIDOS
  ========================= */

  clearSelectedContents(): void {
    this.studyContentIds = [];

    this.studyContentOptions = [];
  }

  /* =========================
     HISTORIAL CONTENIDO
  ========================= */

  loadStudentContentHistory(
    meeting: MeetingDTO,
  ): void {
    this.isLoadingContentHistory =
      true;

    this.selectedMeeting =
      meeting;

    const studentId =
      meeting.studentId;

    const to =
      DateTime.now().toISODate();

    const from =
      '2025-01-01';

    this.studyContentService
      .getStudyContentHistoryForStudentId(
        studentId,
        from,
        to,
      )
      .subscribe({
        next: history =>
          this.handleHistoryLoaded(
            history,
          ),

        error: () =>
          this.handleHistoryError(),
      });
  }

  private handleHistoryLoaded(
    history: StudyContentPayloadI[],
  ): void {
    if (
      history.length === 0
    ) {
      this.finishLoadingWithMessage(
        'No se encontraron contenidos en el historial.',
      );

      return;
    }

    this.studentContentHistory =
      history;

    const studentStageDescription =
      this.selectedMeeting
        ?.stage
        ?.description;

    this.filteredStages =
      this.sortStages(
        this.filteredStages,
      );

    let targetStageIndex =
      this.filteredStages.findIndex(
        s =>
          s.description ===
          studentStageDescription,
      );

    if (
      targetStageIndex === -1
    ) {
      if (
        this.filteredStages.length >
        0
      ) {
        targetStageIndex = 0;
      } else {
        this.finishLoadingWithMessage(
          'No hay stages con contenido disponibles.',
        );

        return;
      }
    }

    this.currentStageIndex =
      targetStageIndex;

    const targetStageId =
      this.filteredStages[
        targetStageIndex
      ].id;

    this.studyContentService
      .filterBy(targetStageId)
      .subscribe({
        next: contents =>
          this.handleStageContentsLoaded(
            contents,
          ),

        error: () =>
          this.finishLoadingWithMessage(
            'Error al cargar los contenidos del stage.',
          ),
      });
  }

  private handleStageContentsLoaded(
    contents: StudyContentDto[],
  ): void {
    this.studentStageContents =
      contents;

    this.isLoadingContentHistory =
      false;

    this.isStudentContentHistoryModalVisible =
      true;
  }

  private handleHistoryError(): void {
    this.finishLoadingWithMessage(
      'Error al cargar el historial de contenidos.',
    );
  }

  private finishLoadingWithMessage(
    message: string,
  ): void {
    this.isLoadingContentHistory =
      false;

    this.showModal(
      this.createModalParams(
        true,
        message,
      ),
    );
  }

  closeStudentContentHistoryModal(): void {
    this.isStudentContentHistoryModalVisible =
      false;
  }

  /* =========================
     COMENTARIOS / RECURSOS
  ========================= */

  onCommentViewRequested(
    event: {
      meeting: MeetingDTO;
      title: string;
    },
  ): void {
    const studentId =
      event.meeting.studentId;

    this.assessmentService
      .findAll({
        studentId:
          String(studentId),
      })
      .subscribe({
        next: assessments => {
          const hasNote =
            assessments.some(
              a => !!a.note,
            );

          const hasResources =
            assessments.some(
              a =>
                a.resources &&
                a.resources.length > 0,
            );

          if (
            hasNote ||
            hasResources
          ) {
            event.meeting.hasReinforcement =
              true;
          }

          const message =
            this.buildHtmlAllNotesAndResources(
              assessments,
              this.minPoints,
            );

          this.showNoteModal(
            event.title,
            message,
          );
        },

        error: () => {
          this.showModal(
            this.createModalParams(
              true,
              'Error al cargar los recursos del estudiante.',
            ),
          );
        },
      });
  }

  /* =========================
     COMENTARIO TEMPORAL
  ========================= */

  onTemporaryCommentViewRequested(
    event: {
      meeting: MeetingDTO;
      title: string;
    },
  ): void {
    const comment =
      event.meeting.student?.user?.temporaryComment ||
      event.meeting.user?.temporaryComment ||
      'Sin comentario temporal';

    const message = `
      <div class="temporary-comment">
        <p>${comment}</p>
      </div>
    `;

    this.showNoteModal(
      event.title,
      message,
    );
  }

  /* =========================
     HTML ASSESSMENTS
  ========================= */

  private buildHtmlAllNotesAndResources(
    assessments: AssessementI[],
    minPoints: number,
  ): SafeHtml {
    const approvedHtml =
      this.generateApprovedAssessments(
        assessments,
        minPoints,
      );

    const notesHtml =
      this.generateNotesSection(
        assessments,
        minPoints,
      );

    const resourcesHtml =
      this.generateResourcesSection(
        assessments,
      );

    const fullHtml =
      `${approvedHtml}${notesHtml}${resourcesHtml}`;

    return this.sanitizer
      .bypassSecurityTrustHtml(
        fullHtml,
      );
  }

  /* =========================
     ASSESSMENTS APROBADOS
  ========================= */

  private generateApprovedAssessments(
    assessments: AssessementI[],
    minPoints: number,
  ): string {
    const approved =
      assessments.filter(
        a =>
          a.points != null &&
          a.points >= minPoints,
      );

    if (!approved.length) {
      return '';
    }

    const items = approved
      .map(a => {
        const date =
          a.createdAt
            ? new Date(
                a.createdAt,
              ).toLocaleDateString()
            : '';

        const instructor =
          a.instructor
            ?.user
            ?.firstName
            ? `${
                a.instructor.user
                  .firstName
              } ${
                a.instructor.user
                  .lastName || ''
              }`
            : 'Instructor no disponible';

        return `
          <div style="margin-bottom: 6px;">
            ${a.type}: ${a.points}<br>

            <small
              style="
                color: #888;
                font-size: 10px;
              "
            >
              ${date} • ${instructor}
            </small>
          </div>
        `;
      })
      .join('');

    return `
      <div style="margin-bottom: 10px;">
        <b>
          Evaluaciones aprobadas:
        </b>

        <br>

        ${items}
      </div>
    `;
  }

  /* =========================
     ASSESSMENTS NO APROBADOS
  ========================= */

  private generateNotesSection(
    assessments: AssessementI[],
    minPoints: number,
  ): string {
    const notes =
      assessments
        .filter(
          a =>
            !!a.note &&
            a.points != null &&
            a.points < minPoints,
        )
        .map(a => {
          const date =
            a.createdAt
              ? new Date(
                  a.createdAt,
                ).toLocaleDateString()
              : '';

          const instructor =
            a.instructor
              ?.user
              ?.firstName
              ? `${
                  a.instructor.user
                    .firstName
                } ${
                  a.instructor.user
                    .lastName || ''
                }`
              : 'Instructor no disponible';

          return `
            <div style="margin-bottom: 6px;">

              <span>
                ${a.type}: ${a.points}
              </span>

              <br>

              <span style="font-size: 10px;">
                ${a.note}
              </span>

              <br>

              <small
                style="
                  color: #888;
                  font-size: 10px;
                "
              >
                ${date} • ${instructor}
              </small>

            </div>
          `;
        })
        .join('');

    return notes
      ? `
        <div style="margin-bottom: 10px;">

          <b>
            Evaluaciones no aprobadas:
          </b>

          <br>

          ${notes}

        </div>
      `
      : '';
  }

  /* =========================
     RECURSOS
  ========================= */

  private generateResourcesSection(
    assessments: AssessementI[],
  ): string {
    const resourceMap =
      new Map<
        number,
        {
          resource: AssessmentResourceI;
          date?: string;
          instructor?: string;
        }
      >();

    assessments.forEach(a => {
      const date =
        a.createdAt
          ? new Date(
              a.createdAt,
            ).toLocaleDateString()
          : '';

      const instructor =
        a.instructor
          ?.user
          ?.firstName
          ? `${
              a.instructor.user
                .firstName
            } ${
              a.instructor.user
                .lastName || ''
            }`
          : 'Instructor no disponible';

      (a as any)
        .resources
        ?.forEach(
          (
            res:
              AssessmentResourceI,
          ) => {
            if (
              !resourceMap.has(
                res.id,
              )
            ) {
              resourceMap.set(
                res.id,
                {
                  resource: res,
                  date,
                  instructor,
                },
              );
            }
          },
        );
    });

    const resourceItems =
      Array.from(
        resourceMap.values(),
      )
        .map(
          ({
            resource,
            date,
            instructor,
          }) => `
            <div
              style="
                margin-bottom: 5px;
              "
            >

              <a
                href="${resource.link}"
                target="_blank"
                rel="noopener noreferrer"
                style="
                  color: #007bff;
                  text-decoration: underline;
                "
              >
                ${resource.title}
              </a>

              <br>

              <small
                style="
                  color: #888;
                  font-size: 8px;
                "
              >
                ${date} • ${instructor}
              </small>

            </div>
          `,
        )
        .join('');

    return resourceItems
      ? `
        <div>

          <b>
            Recursos:
          </b>

          <br>

          <div style="margin-top: 4px;">
            ${resourceItems}
          </div>

        </div>
      `
      : `
        <span style="color: #777;">
          No hay recursos asociados.
        </span>
      `;
  }

  /* =========================
     NOTA INSTRUCTOR
  ========================= */

  onNoteSaved(
    event: {
      meetingId: number;
      note: string;
    },
  ): void {
    this.bookingService
      .updateInstructorNote(
        event.meetingId,
        event.note,
      );

    const meeting =
      this.meetings.find(
        m =>
          m.id ===
          event.meetingId,
      );

    if (meeting) {
      meeting.instructorNote =
        event.note || undefined;
    }

    this.showModal(
      this.createModalParams(
        false,
        'Nota guardada correctamente.',
      ),
    );
  }

  /* =========================
     NOTE MODAL
  ========================= */

  private showNoteModal(
    title: string,
    message: SafeHtml,
  ): void {
    this.modal = {
      ...modalInitializer(),

      show: true,

      title,

      message,

      isContentViewer: true,

      close:
        this.closeModal,
    };
  }

  /* =========================
     CONTENT VIEWER
  ========================= */

  showContentViewer(
    content: string,
    title:
      string =
        'Contenido de la Clase',
  ): void {
    this.modal = {
      ...modalInitializer(),

      show: true,

      message:
        content,

      isContentViewer:
        true,

      title,

      close:
        this.closeModal,
    };
  }

  /* =========================
     MODAL
  ========================= */

  showModal(
    params: ModalDto,
  ): void {
    this.modal = {
      ...params,
    };

    setTimeout(() => {
      this.modal.close();
    }, 2000);
  }

  closeModal = (): void => {
    this.modal = {
      ...modalInitializer(),
    };
  };

  closeConfirmationModal =
    (): void => {
      this.confirmationModal = {
        ...modalInitializer(),
      };
    };

  createModalParams(
    isError: boolean,
    message: string,
  ): ModalDto {
    return {
      ...this.modal,

      show: true,

      isError,

      isSuccess:
        !isError,

      message,

      close:
        this.closeModal,
    };
  }

  /* =========================
     NAVEGACIÓN STAGES
  ========================= */

  goToPreviousStage(): void {
    const prevIndex =
      this.currentStageIndex - 1;

    if (
      prevIndex >= 0
    ) {
      this.currentStageIndex =
        prevIndex;

      const prevStageId =
        this.filteredStages[
          prevIndex
        ].id;

      this.loadStageContents(
        prevStageId,
      );
    }
  }

  goToNextStage(): void {
    const nextIndex =
      this.currentStageIndex + 1;

    if (
      nextIndex <
      this.filteredStages.length
    ) {
      this.currentStageIndex =
        nextIndex;

      const nextStageId =
        this.filteredStages[
          nextIndex
        ].id;

      this.loadStageContents(
        nextStageId,
      );
    }
  }

  get canGoPrevious(): boolean {
    return (
      this.currentStageIndex > 0
    );
  }

  get canGoNext(): boolean {
    return (
      this.currentStageIndex <
      this.filteredStages.length - 1
    );
  }

  /* =========================
     EVALUACIÓN
  ========================= */

  onEvaluationRequested(
    studentId: number,
  ): void {
    if (!studentId) {
      return;
    }

    this.assessmentService
      .findAll({
        studentId:
          String(studentId),
      })
      .subscribe({
        next: assessments => {
          this.assessmentsByStudent =
            assessments;

          this.highlightStageId =
            assessments[0]
              ?.student
              ?.stageId ||
            null;

          this.showEvaluationModal =
            true;
        },

        error: () => {
          this.showModal(
            this.createModalParams(
              true,
              'Error al cargar las evaluaciones del estudiante.',
            ),
          );
        },
      });
  }
}