import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  DemoClassLead,
  LeadSchedulingAssignedSummary,
  NewStudentRow,
  Notification,
} from '../../../../services/dtos/notification.dto';
import {
  UserDto,
  UserRole,
} from '../../../../services/dtos/user.dto';

import {
  SafeNoteHtmlPipe,
} from '../../../../pipes/safe-note-html.pipe';

@Component({
  selector: 'app-notification-detail-content',
  standalone: true,
  imports: [
    CommonModule,
    SafeNoteHtmlPipe,
  ],
  templateUrl:
    './notification-detail-content.component.html',
  styleUrls: [
    './notification-detail-content.component.scss',
  ],
})
export class NotificationDetailContentComponent {

  @Input({ required: true })
  notification!: Notification;

  @Input()
  formattedBody = '';

  @Input()
  showNotificationRawBody = false;

  @Input()
  audienceLine = '';

  @Input()
  userRole: UserRole | null = null;

  @Input()
  isAdmin = false;

  @Input()
  showRecipients = false;

  @Input()
  showAllRecipients = false;

  @Input()
  recipients: UserDto[] = [];

  @Input()
  studentRows: NewStudentRow[] = [];

  @Input()
  hasStudentRows = false;

  @Input()
  isDemoClassNotification = false;

  @Input()
  isPlacementExamNotification = false;

  @Input()
  isLeadRequestNotification = false;

  @Input()
  requestLead: DemoClassLead | null = null;

  @Input()
  placementExamSubtypeLabel: string | null = null;

  @Input()
  isPlacementTestRequestNotification = false;

  @Input()
  isSpeakingPlacementRequestNotification = false;

  @Input()
  assignedIsPlacementTest = false;

  @Input()
  isLeadSchedulingInstructorCard = false;

  @Input()
  leadSchedulingAssignedSummary:
    LeadSchedulingAssignedSummary = {};

  @Input()
  leadSchedulingShowGenericNextStep = false;

  @Input()
  showPlacementExamListLink = false;

  @Output()
  toggleRecipients =
    new EventEmitter<void>();

  @Output()
  goToPlacementExamList =
    new EventEmitter<void>();

  @Output()
  goToAssignedLeadScheduling =
    new EventEmitter<void>();

  @Output()
  goToLeadRequestAdminDetail =
    new EventEmitter<void>();

  @Output()
  goToActiveStudentsReport =
    new EventEmitter<void>();

  @Output()
  toggleStudentMenu =
    new EventEmitter<number>();

  @Output()
  editStudent =
    new EventEmitter<NewStudentRow>();

  protected readonly UserRole = UserRole;

  onToggleRecipients(): void {
    this.toggleRecipients.emit();
  }

  onGoToPlacementExamList(): void {
    this.goToPlacementExamList.emit();
  }

  onGoToAssignedLeadScheduling(): void {
    this.goToAssignedLeadScheduling.emit();
  }

  onGoToLeadRequestAdminDetail(): void {
    this.goToLeadRequestAdminDetail.emit();
  }

  onGoToActiveStudentsReport(): void {
    this.goToActiveStudentsReport.emit();
  }

  onToggleStudentMenu(
    index: number,
  ): void {
    this.toggleStudentMenu.emit(index);
  }

  onEditStudent(
    student: NewStudentRow,
  ): void {
    this.editStudent.emit(student);
  }

  trackByRecipientId(
    index: number,
    recipient: UserDto,
  ): number {
    return recipient.id;
  }

  trackByStudentIndex(
    index: number,
  ): number {
    return index;
  }

  get isStudentAssessmentAccess(): boolean {
    return (
      this.userRole === UserRole.STUDENT &&
      this.notification?.message?.kind === 'assessment-assigned' &&
      !!(
        this.notification?.message?.directAccessUrl ||
        this.notification?.message?.shareUrl
      )
    );
  }

  get assessmentDirectAccessUrl(): string {
    return this.notification?.message?.directAccessUrl || '';
  }

  get assessmentShareUrl(): string {
    return this.notification?.message?.shareUrl || '';
  }

  get assessmentAccessCode(): string {
    return this.notification?.message?.studentAccessCode || '';
  }

  openAssessment(): void {
    if (!this.assessmentDirectAccessUrl) return;

    window.open(
      this.assessmentDirectAccessUrl,
      '_blank',
      'noopener,noreferrer',
    );
  }

  copyToClipboard(value: string): void {
    if (!value) return;

    navigator.clipboard.writeText(value);
  }
}