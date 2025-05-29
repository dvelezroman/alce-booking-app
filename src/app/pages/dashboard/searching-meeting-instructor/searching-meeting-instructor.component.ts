import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { DateTime } from 'luxon';
import { ContentSelectorComponent } from '../../../components/contenido/content-selector/content-selector.component';
import { StudentContentHistoryModalComponent } from '../../../components/contenido/student-content-history-modal/student-content-history-modal.component';
import { CreateMeetingModalComponent } from '../../../components/instructor/create-meeting/create-meeting-modal.component';
import { MeetingFilterComponent } from '../../../components/instructor/meeting-filter/meeting-filter.component';
import { MeetingTableComponent } from '../../../components/instructor/meeting-table/meeting-table.component';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { BookingService } from '../../../services/booking.service';
import { MeetingDTO, FilterMeetingsDto, CreateMeetingDto } from '../../../services/dtos/booking.dto';
import { Stage } from '../../../services/dtos/student.dto';
import { StudyContentDto, StudyContentPayloadI } from '../../../services/dtos/study-content.dto';
import { UserDto } from '../../../services/dtos/user.dto';
import { StagesService } from '../../../services/stages.service';
import { StudyContentService } from '../../../services/study-content.service';
import { selectUserData, selectInstructorLink } from '../../../store/user.selector';
import { AssessmentResourceI } from '../../../services/dtos/assessment-resources.dto';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AssessmentService } from '../../../services/assessment.service';
import { AssessementI } from '../../../services/dtos/assessment.dto';
import { AssessmentPointsConfigService } from '../../../services/assessment-points-config.service';

@Component({
  selector: 'app-searching-meeting-instructor',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CreateMeetingModalComponent,
    ModalComponent,
    ContentSelectorComponent,
    StudentContentHistoryModalComponent,
    MeetingTableComponent,
    MeetingFilterComponent
  ],
  templateUrl: './searching-meeting-instructor.component.html',
  styleUrl: './searching-meeting-instructor.component.scss'
})
export class SearchingMeetingInstructorComponent implements OnInit {
  selectedMeeting?: MeetingDTO;

  stages: Stage[] = [];
  meetings: MeetingDTO[] = [];
  filteredStages: Stage[] = [];
  availableHours: number[] = [];
  studyContentIds: number[] = [];
  studentStageContents: StudyContentDto[] = [];
  studentContentHistory: StudyContentPayloadI[] = [];
  ageGroupOptions: string[] = ['KIDS', 'TEENS', 'ADULTS'];
  studyContentOptions: { id: number; name: string }[] = [];

  currentStageIndex: number = 0;
  minPoints: number = 0; 

  instructorId: number | null = null;
  instructorLink: string | null = null;

  showForm: boolean = true;
  showCreateModal: boolean = false;
  isLoadingContentHistory: boolean = false;
  isStudentContentHistoryModalVisible: boolean = false;

  modal: ModalDto = modalInitializer();
  confirmationModal: ModalDto = modalInitializer();

  filter: FilterMeetingsDto = {
    from: '',
    to: '',
    hour: '',
    assigned: true,
    category: undefined
  };
  constructor(
    private store: Store,
    private sanitizer: DomSanitizer,
    private stagesService: StagesService,
    private bookingService: BookingService,
    private studyContentService: StudyContentService,
    private assessmentService: AssessmentService,
    private pointsConfigService: AssessmentPointsConfigService

  ) {}

  ngOnInit(): void {
    this.filter.category = undefined;
    this.loadStagesWithContent();
    this.loadAssessmentConfig();


    this.stagesService.getAll().subscribe(response => {
      this.stages = response;

    this.filter.stageId = '';
    })

    this.availableHours = Array.from({ length: 13 }, (_, i) => 8 + i);

    this.store.select(selectUserData).subscribe((userData: UserDto | null) => {
      if (userData && userData.instructor) {
        this.instructorId = userData.instructor.id;
        //console.log('instructor ID:', this.instructorId);
      } else {
       // console.log('instructor ID no disponible');
      }
    });
    this.store.select(selectInstructorLink).subscribe(link => {
      this.instructorLink = link;
      //console.log('Instructor link:', link);
    });
  }

  loadAssessmentConfig(): void {
    this.pointsConfigService.getById().subscribe(config => {
      this.minPoints = config.minPointsAssessment;
    });
  }

  private loadStagesWithContent(): void {
    this.stagesService.getAll().subscribe(allStages => {
      const stagesWithContent: Stage[] = [];
      let processedCount = 0;

      allStages.forEach(stage => {
        this.studyContentService.filterBy(stage.id).subscribe(contents => {
          if (contents.length > 0) stagesWithContent.push(stage);

          processedCount++;
          if (processedCount === allStages.length) {
            this.handleStagesLoaded(allStages, stagesWithContent);
          }
        });
      });
    });
  }

  private handleStagesLoaded(allStages: Stage[], stagesWithContent: Stage[]): void {
    this.filteredStages = this.sortStages(stagesWithContent);
    this.stages = this.sortStages(allStages);
    this.filter.stageId = '';
  }

  private sortStages(stages: Stage[]): Stage[] {
    return stages.sort((a, b) => this.extractStageNumber(a.number) - this.extractStageNumber(b.number));
  }

  private extractStageNumber(stageLabel: string): number {
    return parseFloat(stageLabel.replace(/[^0-9.]/g, '')) || 0;
  }
  

  isToday(date: Date | string): boolean {
    if (!date) return false;

    const today = DateTime.now().setZone('America/Guayaquil').startOf('day');
    const meetingDate = typeof date === 'string'
      ? DateTime.fromISO(date, { zone: 'America/Guayaquil' }).startOf('day')
      : DateTime.fromJSDate(date, { zone: 'America/Guayaquil' }).startOf('day');

    return today.toISODate() === meetingDate.toISODate();
  }

  onFilterChange(): void {
    this.clearSelectedContents();
    
    const filterParams: FilterMeetingsDto = {
      ...this.filter,
      hour: this.filter.hour ? this.filter.hour.toString() : undefined,
      category: this.filter.category ? this.filter.category : undefined
    };
    this.fetchMeetings(filterParams);
  }

  private fetchMeetings(params?: FilterMeetingsDto): void {
    const searchParams: FilterMeetingsDto = {
      ...params,
      instructorId: this.instructorId ? this.instructorId.toString() : undefined,
    };

    this.bookingService.searchMeetings(searchParams).subscribe(meetings => {
      this.meetings = meetings;
    });
  }

  onAssistanceCheckboxClick(event: Event, meeting: MeetingDTO) {
    event.preventDefault();
    this.confirmAssistanceWithContentCheck(meeting);
  }

  confirmAssistanceWithContentCheck(meeting: MeetingDTO) {
    const isCancellingAssistance = meeting.present;

    if (isCancellingAssistance) {
      this.confirmationModal = {
        ...modalInitializer(),
        show: true,
        isInfo: true,
        message: '¿Estás seguro de cancelar la asistencia?<br>Si cancelas la asistencia también se eliminará el contenido, si lo hubiere.',
        showButtons: true,
        confirm: () => {
          this.toggleSelection(meeting);
          this.closeConfirmationModal();
        },
        close: this.closeConfirmationModal,
      };
      return;
    }

    if (this.studyContentIds.length === 0) {
      this.showModal(this.createModalParams(true, 'Para marcar asistencia debes agregar al menos un contenido para la clase.'));
      return;
    }

      this.toggleSelection(meeting);
    }

  toggleSelection(meeting: MeetingDTO) {
    if (meeting && meeting.id) {
      const updatedPresence = !meeting.present;
      this.bookingService.updateAssistance(meeting.id, !meeting.present, this.studyContentIds).subscribe({
        next: () => {
            //console.log(`Asistencia actualizada para ${studentName}: ${asistenciaTexto}`);
          const filterParams: FilterMeetingsDto = {
            ...this.filter,
          };
          this.fetchMeetings(filterParams);
          const messageText = updatedPresence ? 'Presente' : 'Ausente';
          this.showModal(this.createModalParams(false, `Asistencia actualizada: ${messageText}`));
        },
        error: () => {
          //console.error(`Error al actualizar la asistencia de ${studentName}:`, error);
          this.showModal(this.createModalParams(true, 'Error al actualizar la asistencia'));
        }
      });
    }
  }

  hasMeetingPassed(localdate: string | Date, hour: number): boolean {
    if (!localdate || hour === undefined) return false;

    const meetingDateTime = DateTime.fromISO(String(localdate))
      .set({ hour, minute: 0 })
      .setZone('America/Guayaquil');
    const now = DateTime.now().setZone('America/Guayaquil');

    return now > meetingDateTime;
  }

  onCreateMeeting(): void {
    this.showCreateModal = true;
  }

  handleMeetingCreated(meeting: CreateMeetingDto): void {
    const isOnline = meeting.mode === 'ONLINE';

    const meetingWithInstructorInfo: CreateMeetingDto = {
      ...meeting,
      link: isOnline ? this.instructorLink ?? undefined : undefined,
      password: isOnline && this.instructorId ? this.instructorId.toString() : undefined,
    };

    this.bookingService.bookMeeting(meetingWithInstructorInfo).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.showModal(this.createModalParams(false, 'Clase creada exitosamente.'));
        this.fetchMeetings(this.filter);
      },
      error: (error) => {
        const msg = error?.error?.message || 'No se pudo crear la clase';
        this.showModal(this.createModalParams(true, msg));
        this.showCreateModal = false;
      }
    });
  }

  onContentIdsSelected(ids: number[]) {
    this.studyContentIds = ids;
    this.loadContentNames(ids);
  }

  loadContentNames(contentIds: number[]) {
    if (contentIds.length === 0) {
    this.studyContentOptions = [];
    return;
  }

    this.studyContentService.getManyStudyContents(contentIds).subscribe(contents => {
      this.studyContentOptions = contents.map(c => ({
          id: c.id,
          name: `Stage ${c.stage?.number || c.stageId}, ${c.title}`
        }));
    });
  }

  loadStageContents(stageId: number): void {
    this.studyContentService.filterBy(stageId).subscribe({
      next: (contents) => {
        const validContents = contents.filter(c => typeof c.unit === 'number' && c.unit > 0);
        this.studentStageContents = validContents;
      },
      error: () => {
        this.showModal(this.createModalParams(true, 'Error al cargar los contenidos del stage.'));
      }
    });
  }

  formatStudyContent(meeting: MeetingDTO): string {
    if (!meeting.studyContent || meeting.studyContent.length === 0) {
      return 'Sin contenido';
    }
    return meeting.studyContent
      .map(c => `${c.title}`)
      .join('\n');
  }

  clearSelectedContents() {
    this.studyContentIds = [];
    this.studyContentOptions = [];
  }

  loadStudentContentHistory(meeting: MeetingDTO): void {
    this.isLoadingContentHistory = true;
    this.selectedMeeting = meeting;

    const studentId = meeting.studentId;
    const to = DateTime.now().toISODate();
    const from = DateTime.now().minus({ days: 21 }).toISODate();

    this.studyContentService.getStudyContentHistoryForStudentId(studentId, from, to).subscribe({
      next: (history) => this.handleHistoryLoaded(history),
      error: () => this.handleHistoryError()
    });
  }

  private handleHistoryLoaded(history: StudyContentPayloadI[]): void {
    if (history.length === 0) {
      this.finishLoadingWithMessage('No se encontraron contenidos en el historial.');
      return;
    }

    this.studentContentHistory = history;

    const studentStageDescription = this.selectedMeeting?.stage?.description;
    this.filteredStages = this.sortStages(this.filteredStages);

    let targetStageIndex = this.filteredStages.findIndex(
      s => s.description === studentStageDescription
    );

    if (targetStageIndex === -1) {
      if (this.filteredStages.length > 0) {
        targetStageIndex = 0; 
      } else {
        this.finishLoadingWithMessage('No hay stages con contenido disponibles.');
        return;
      }
    }

    this.currentStageIndex = targetStageIndex;
    const targetStageId = this.filteredStages[targetStageIndex].id;

    this.studyContentService.filterBy(targetStageId).subscribe({
      next: (contents) => this.handleStageContentsLoaded(contents),
      error: () => this.finishLoadingWithMessage('Error al cargar los contenidos del stage.')
    });
  }

  private handleStageContentsLoaded(contents: StudyContentDto[]): void {
    this.studentStageContents = contents;
    this.isLoadingContentHistory = false;
    this.isStudentContentHistoryModalVisible = true;
  }

  private handleHistoryError(): void {
    this.finishLoadingWithMessage('Error al cargar el historial de contenidos.');
  }

  private finishLoadingWithMessage(message: string): void {
    this.isLoadingContentHistory = false;
    this.showModal(this.createModalParams(true, message));
  }

  closeStudentContentHistoryModal() {
    this.isStudentContentHistoryModalVisible = false;
  }

  onCommentViewRequested(event: { meeting: MeetingDTO; title: string }): void {
    const studentId = event.meeting.studentId;

    this.assessmentService.findAll({ studentId: String(studentId) }).subscribe({
      next: (assessments) => {
        const message = this.buildHtmlAllNotesAndResources(assessments, this.minPoints);
        this.showNoteModal(event.title, message);
      },
      error: () => {
        this.showModal(this.createModalParams(true, 'Error al cargar los recursos del estudiante.'));
      }
    });
  }

  private buildHtmlAllNotesAndResources(assessments: AssessementI[], minPoints: number): SafeHtml {
    const approvedHtml = this.generateApprovedAssessments(assessments, minPoints);
    const notesHtml = this.generateNotesSection(assessments, minPoints);
    const resourcesHtml = this.generateResourcesSection(assessments);
    const fullHtml = `${approvedHtml}${notesHtml}${resourcesHtml}`;
    return this.sanitizer.bypassSecurityTrustHtml(fullHtml);
  }

  private generateApprovedAssessments(assessments: AssessementI[], minPoints: number): string {
    const approved = assessments.filter(a => a.points >= minPoints);
    if (!approved.length) return '';

    const items = approved.map(a => {
      const date = a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '';
      const instructor = a.instructor?.user?.firstName
        ? `${a.instructor.user.firstName} ${a.instructor.user.lastName || ''}`
        : 'Instructor no disponible';
      return `<div style="margin-bottom: 6px;">
                ${a.type}: ${a.points}<br>
                <small style="color: #888; font-size: 10px;">${date} • ${instructor}</small>
              </div>`;
    }).join('');

    return `<div style="margin-bottom: 12px;">
              <b>Evaluaciones aprobadas:</b><br>
              ${items}
            </div>`;
  }

  private generateNotesSection(assessments: AssessementI[], minPoints: number): string {
    const notes = assessments
      .filter(a => !!a.note && a.points < minPoints)
      .map(a => {
        const date = a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '';
        const instructor = a.instructor?.user?.firstName
          ? `${a.instructor.user.firstName} ${a.instructor.user.lastName || ''}`
          : 'Instructor no disponible';

        return `<div style="margin-bottom: 6px;">
                  <span>${a.type}: ${a.points}</span><br>
                  <span>${a.note}</span><br>
                  <small style="color: #888; font-size: 8px;">${date} • ${instructor}</small>
                </div>`;
      })
      .join('');

    return notes
      ? `<div style="margin-bottom: 12px;">
          <b>Evaluaciones no aprobadas:</b><br>
          ${notes}
        </div>`
      : '';
  }

  private generateResourcesSection(assessments: AssessementI[]): string {
    const resourceMap = new Map<number, { resource: AssessmentResourceI; date?: string; instructor?: string }>();

    assessments.forEach(a => {
      const date = a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '';
      const instructor = a.instructor?.user?.firstName
        ? `${a.instructor.user.firstName} ${a.instructor.user.lastName || ''}`
        : 'Instructor no disponible';

      (a as any).resources?.forEach((res: AssessmentResourceI) => {
        if (!resourceMap.has(res.id)) {
          resourceMap.set(res.id, { resource: res, date, instructor });
        }
      });
    });

    const resourceItems = Array.from(resourceMap.values())
      .map(({ resource, date, instructor }) =>
        `<div style="margin-bottom: 5px;">
          <a href="${resource.link}" target="_blank" rel="noopener noreferrer"
              style="color: #007bff; text-decoration: underline;">${resource.title}</a><br>
          <small style="color: #888; font-size: 8px;">${date} • ${instructor}</small>
        </div>`
      )
      .join('');

    return resourceItems
      ? `<div>
          <b>Recursos:</b><br>
          <div style="margin-top: 4px;">${resourceItems}</div>
        </div>`
      : '<span style="color: #777;">No hay recursos asociados.</span>';
  }

  private showNoteModal(title: string, message: SafeHtml): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      title,
      message,
      isContentViewer: true,
      close: this.closeModal,
    };
  }

  showContentViewer(content: string, title: string = 'Contenido de la Clase'){
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: content,
      isContentViewer: true,
      title,
      close: this.closeModal,
    };
  }

  showModal(params: ModalDto) {
    this.modal = { ...params };
    setTimeout(() => {
      this.modal.close();
    }, 2000);
  }

  closeModal = () => {
    this.modal = { ...modalInitializer() };
  }

  closeConfirmationModal = () => {
    this.confirmationModal = { ...modalInitializer() };
  }

  createModalParams(isError: boolean, message: string): ModalDto {
    return {
      ...this.modal,
      show: true,
      isError,
      isSuccess: !isError,
      message,
      close: this.closeModal
    };
  }

  goToPreviousStage() {
    const prevIndex = this.currentStageIndex - 1;
    if (prevIndex >= 0) {
      this.currentStageIndex = prevIndex;
      const prevStageId = this.filteredStages[prevIndex].id;
      this.loadStageContents(prevStageId);
    }
  }

  goToNextStage() {
    const nextIndex = this.currentStageIndex + 1;
    if (nextIndex < this.filteredStages.length) {
      this.currentStageIndex = nextIndex;
      const nextStageId = this.filteredStages[nextIndex].id;
      this.loadStageContents(nextStageId);
    }
  }

  get canGoPrevious(): boolean {
    return this.currentStageIndex > 0;
  }

  get canGoNext(): boolean {
    return this.currentStageIndex < this.filteredStages.length - 1;
  }
}

