import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';

import { UserDto, UserRole, UserStatus, SuspensionInfo } from '../../../services/dtos/user.dto';
import { StageAssessment } from '../../../services/dtos/stage-assessment.dto';

import { UsersService } from '../../../services/users.service';
import { StudentsService } from '../../../services/students.service';

import {
  setDataCompleted,
  updateStudentData,
  updateUserData,
} from '../../../store/user.action';

import { CountdownBannerComponent } from '../../../components/home/countdown-banner/countdown-banner.component';
import { AssessmentAnnouncementComponent } from '../../../components/home/assessment-announcement/assessment-announcement.component';
import { StudentLiveClassesComponent } from '../../../components/student-live-classes/student-live-classes.component';
import { PendingAssessmentCardComponent } from '../../../components/home/pending-assessment-card/pending-assessment-card.component';
import { StudentCuencaBannerComponent } from '../../../components/home/student-cuenca-banner/student-cuenca-banner.component';
import { StudentCuencaCommBannerComponent } from '../../../components/home/student-cuenca-comm-banner/student-cuenca-comm-banner.component';
import { ImageBannerComponent } from '../../../components/home/image-banner/image-banner.component';
import { StudentSuspensionModalComponent } from '../../../components/home/student-suspension-modal/student-suspension-modal.component';
import { UserInfoFormComponent } from '../../../components/home/user-info-form/user-info-form.component';
import { InstructorEvaluationService } from '../../../services/instructor-evaluation.service';
import { PendingClassEvaluationBannerComponent } from "../../home/pending-class-evaluation-banner/pending-class-evaluation-banner.component";
import { StudentIntroVideoService } from '../../../services/student-intro-video.service';
import { StudentIntroVideoComponent } from "../../home/student-intro-video/student-intro-video.component";

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    CountdownBannerComponent,
    AssessmentAnnouncementComponent,
    StudentLiveClassesComponent,
    PendingAssessmentCardComponent,
    StudentCuencaBannerComponent,
    // StudentCuencaCommBannerComponent,
    // ImageBannerComponent,
    StudentSuspensionModalComponent,
    UserInfoFormComponent,
    PendingClassEvaluationBannerComponent,
    StudentIntroVideoComponent
],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss',
})
export class StudentDashboardComponent implements OnInit, OnChanges, OnDestroy {

  private readonly INTRO_VIDEO_SESSION_KEY = 'intro-video-shown-session';
  private readonly URGENT_MODAL_KEY = 'urgent_assessment_last_shown';

  @Input() userData: UserDto | null = null;
  @Input() isLoggedIn = false;

  modal: ModalDto = modalInitializer();

  /* UI FLAGS */
  showUserInfoForm = false;
  showBannerCuenca = false;
  showBannerCuencaComm = false;
  showImageBanner = true;
  showAssessmentAnnouncement = false;
  showSuspensionModal = false;

  /* DATA */
  pendingAssessmentsCount = 0;
  pendingClassEvaluationsCount = 0;
  hasPendingClassEvaluations = false;
  assessments: StageAssessment[] = [];
  hasLiveClasses = false;
  suspensionInfo: SuspensionInfo | null = null;

  /* intro video */
  showIntroVideo = false;
  canCloseIntroVideo = false;

  private urgentReminderInterval: any = null;
  hasUrgentAssessment = false;


  constructor(
    private router: Router,
    private store: Store,
    private usersService: UsersService,
    private studentsService: StudentsService,
    private introVideoService: StudentIntroVideoService,
    private instructorEvaluationService: InstructorEvaluationService
  ) {}

  ngOnInit(): void {

    if (
      this.isLoggedIn &&
      this.userData?.id &&
      !sessionStorage.getItem(this.INTRO_VIDEO_SESSION_KEY)
    ) {
      const hasSeenVideo =
        this.introVideoService.hasSeenVideo(this.userData.id);

      this.showIntroVideo = true;
      this.canCloseIntroVideo = hasSeenVideo;
    }

    if (this.isLoggedIn && this.shouldShowAnnouncement()) {
      this.showAssessmentAnnouncement = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Cuando llega el user (async) o cuando cambia (ej: updateUserData),
    // aquí recalculamos TODO lo que depende del usuario.
    if (changes['userData']) {
      this.applyUserState();
    }

    if (changes['isLoggedIn']) {
      if (this.isLoggedIn && this.shouldShowAnnouncement()) {
        this.showAssessmentAnnouncement = true;
      }
    }
  }

  ngOnDestroy(): void {
    this.clearUrgentReminder();
  }

  private loadPendingClassEvaluations(): void {
    this.instructorEvaluationService
      .getPendingEvaluations(50, 0)
      .subscribe({
        next: (pending) => {
          this.pendingClassEvaluationsCount = pending.length;
          this.hasPendingClassEvaluations = pending.length > 0;
        },
        error: () => {
          this.pendingClassEvaluationsCount = 0;
          this.hasPendingClassEvaluations = false;
        }
      });
  }

  private applyUserState(): void {
    const user = this.userData;
    if (!user || user.role !== UserRole.STUDENT) return;

    // ===== BANNER CUENCA =====
    const city = (user.city || '').toLowerCase().trim();
    const showCityBanners = city === 'cuenca';

    this.showBannerCuenca = showCityBanners;
    this.showBannerCuencaComm = showCityBanners;

    // ===== SUSPENSIÓN =====
    if (user.suspensionInfo?.isSuspended) {
      this.suspensionInfo = user.suspensionInfo;
      this.showSuspensionModal = true;
    } else {
      this.suspensionInfo = null;
      this.showSuspensionModal = false;
    }

    // ===== FORM DATOS USUARIO =====
    this.checkUserFormRequirements(user);

    // ===== ANNOUNCEMENT =====
    if (this.isLoggedIn && this.shouldShowAnnouncement()) {
      this.showAssessmentAnnouncement = true;
    }

    this.loadPendingClassEvaluations();
  }

  /* ============================
     UI HELPERS (SALUDO / STAGE)
     ============================ */
  get studentName(): string {
    return this.userData?.firstName || '';
  }

  get studentStage(): string {
    return this.userData?.stage?.description || 'Sin asignar';
  }

  get isAgendaBlocked(): boolean {
    return this.userData?.status === UserStatus.BLOCK;
  }

  get agendaBlockMessage(): string {
    const reason = this.userData?.schedulingBlockReason;

    if (reason && reason.trim().length > 0) {
      return reason;
    }

    return 'No puedes agendar por evaluaciones expiradas';
  }

  /* ============================
     USER INFO FORM
     (MISMO NOMBRE)
     ============================ */
  private checkUserFormRequirements(user: UserDto): void {
    const noBirthday = !user.birthday;
    const notCompleted = user.dataCompleted === false;

    const isMinor =
      user.role === UserRole.STUDENT &&
      !!user.birthday &&
      this.calculateAge(user.birthday) < 18;

    const missingTutorData =
      isMinor &&
      (!user.student?.tutorName ||
        !user.student?.tutorEmail ||
        !user.student?.tutorPhone);

    this.showUserInfoForm = noBirthday || notCompleted || missingTutorData;
  }

  handleUserInfoSubmit(data: {
    email: string;
    contact: string;
    city: string;
    country: string;
    birthday: string;
    occupation: string;
    tutorName?: string;
    tutorEmail?: string;
    tutorPhone?: string;
  }) {
    if (!this.userData?.id) return;

    const payload = {
      emailAddress: data.email,
      birthday: data.birthday,
      contact: data.contact,
      city: data.city,
      country: data.country,
      occupation: data.occupation,
    };

    this.usersService.update(this.userData.id, payload).subscribe({
      next: () => {
        // actualiza store
        this.store.dispatch(updateUserData({ user: { ...this.userData!, ...payload } }));
        this.store.dispatch(setDataCompleted({ completed: true }));

        // cierra form
        this.showUserInfoForm = false;

        // recalcular banners INMEDIATO (sin esperar a que llegue userData nuevo)
        const city = (data.city || '').toLowerCase().trim();
        const showCuencaBanner = city === 'cuenca';

        this.showBannerCuenca = showCuencaBanner;
        this.showBannerCuencaComm = showCuencaBanner;

        // tutor info si aplica
        const hasTutorData = !!(data.tutorName || data.tutorEmail || data.tutorPhone);
        if (this.userData?.student?.id && hasTutorData) {
          this.updateTutorInfo(this.userData.student.id, data);
        }

        this.showModal(false, 'Información actualizada con éxito.');
      },
      error: () => {
        this.showModal(true, 'Error al actualizar información.');
      },
    });
  }

  private updateTutorInfo(studentId: number, data: any) {
    const tutorPayload = {
      tutorName: data.tutorName || null,
      tutorEmail: data.tutorEmail || null,
      tutorPhone: data.tutorPhone || null,
    };

    this.studentsService.updateStudentById(studentId, tutorPayload).subscribe({
      next: (updatedStudent) => {
        this.store.dispatch(updateStudentData({ student: updatedStudent }));
      },
    });
  }

  /* ============================
     ASSESSMENTS
     ============================ */
  onAssessmentsLoaded(list: StageAssessment[]) {
    this.assessments = list;
    this.hasUrgentAssessment = this.checkUrgentAssessment(list);

    const FIVE_MINUTES = 5 * 60 * 1000;

    if (this.hasUrgentAssessment) {
      const lastShown = localStorage.getItem(this.URGENT_MODAL_KEY);

      if (!lastShown) {
        this.showAssessmentAnnouncement = true;
        localStorage.setItem(this.URGENT_MODAL_KEY, Date.now().toString());
      } else {
        const diff = Date.now() - Number(lastShown);

        if (diff >= FIVE_MINUTES) {
          this.showAssessmentAnnouncement = true;
          localStorage.setItem(this.URGENT_MODAL_KEY, Date.now().toString());
        }
      }

      this.startUrgentReminder();

    } else {
      this.clearUrgentReminder();
      localStorage.removeItem(this.URGENT_MODAL_KEY);
    }
  }

  private checkUrgentAssessment(list: StageAssessment[]): boolean {
    const now = Date.now();
    const LIMIT = 24 * 60 * 60 * 1000; 

    return list.some(a => {
      if (!a.dueDate) return false;
      if (a.finished && a.finished.length > 0) return false;

      const due = new Date(a.dueDate.replace('Z', '')).getTime();
      const diff = due - now;

      return diff > 0 && diff <= LIMIT;
    });
  }

  onAnnouncementClosed() {
    this.showAssessmentAnnouncement = false;

    if (this.hasUrgentAssessment) {
      this.startUrgentReminder();
    }
  }

  startUrgentReminder(): void {
    if (this.urgentReminderInterval) return;

    const FIVE_MINUTES = 5 * 60 * 1000;

    this.urgentReminderInterval = setInterval(() => {
      if (this.hasUrgentAssessment) {
        this.showAssessmentAnnouncement = true;
        localStorage.setItem(this.URGENT_MODAL_KEY, Date.now().toString());
      } else {
        this.clearUrgentReminder();
      }
    }, FIVE_MINUTES);
  }

  private clearUrgentReminder(): void {
    if (this.urgentReminderInterval) {
      clearInterval(this.urgentReminderInterval);
      this.urgentReminderInterval = null;
    }
  }

  /* ============================
     HELPERS
     ============================ */
  private calculateAge(dateStr: string): number {
    const birth = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  private shouldShowAnnouncement(): boolean {
    return !localStorage.getItem('assessment_announced');
  }

   goToBooking(): void {
    this.router.navigate(['/dashboard/booking']);
  }

  goToInstructorEvaluations(): void {
    this.router.navigate(['/dashboard/instructor-evaluations']);
  }

  goToAssessments(): void {
    this.router.navigate(['/dashboard/stage-assessment-student']);
  }

  goToNotifications(): void {
    this.router.navigate(['/dashboard/notifications-inbox']);
  }

  goToProfile(): void {
    this.router.navigate(['/dashboard/profile']);
  }

  showModal(isError: boolean, message: string) {
    this.modal = {
      ...this.modal,
      show: true,
      isError,
      isSuccess: !isError,
      message,
      close: () => (this.modal.show = false),
    };
    setTimeout(() => (this.modal.show = false), 2500);
  }

  onIntroVideoCompleted(): void {
    if (!this.userData?.id) return;

    this.introVideoService.markAsSeen(this.userData.id);

    this.canCloseIntroVideo = true;
  }

  onIntroVideoClosed(): void {
    this.showIntroVideo = false;
    sessionStorage.setItem(this.INTRO_VIDEO_SESSION_KEY, 'true');
  }
  

}