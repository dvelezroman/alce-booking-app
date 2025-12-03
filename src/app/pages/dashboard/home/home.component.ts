import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../components/modal/modal.component';
import {
  ModalDto,
  modalInitializer,
} from '../../../components/modal/modal.dto';
import { UserDto, UserRole } from '../../../services/dtos/user.dto';
import { StudyContentService } from '../../../services/study-content.service';
import { selectIsLoggedIn, selectUserData } from '../../../store/user.selector';
import { UsersService } from '../../../services/users.service';
import {
  setDataCompleted,
  updateStudentData,
  updateUserData,
} from '../../../store/user.action';
import { UserInfoFormComponent } from '../../../components/home/user-info-form/user-info-form.component';
import { StudentsService } from '../../../services/students.service';
import { InstructorCalendarComponent } from '../../../components/home/instructor-calendar/instructor-calendar.component';
import { StudentBannerComponent } from '../../../components/home/student-banner/student-banner.component';
import { StudentCuencaBannerComponent } from '../../../components/home/student-cuenca-banner/student-cuenca-banner.component';
import { StudentCuencaCommBannerComponent } from '../../../components/home/student-cuenca-comm-banner/student-cuenca-comm-banner.component';
import { CountdownBannerComponent } from '../../../components/home/countdown-banner/countdown-banner.component';
import { AssessmentAnnouncementComponent } from "../../../components/home/assessment-announcement/assessment-announcement.component";
import { StudentLiveClassesComponent } from "../../../components/student-live-classes/student-live-classes.component";

@Component({
  selector: 'app-home-private',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ModalComponent,
    UserInfoFormComponent,
    InstructorCalendarComponent,
    StudentBannerComponent,
    StudentCuencaBannerComponent,
    StudentCuencaCommBannerComponent,
    CountdownBannerComponent,
    AssessmentAnnouncementComponent,
    StudentLiveClassesComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomePrivateComponent implements OnInit {
  modal: ModalDto = modalInitializer();

  isLoggedIn$: Observable<boolean>;
  isLoggedIn: boolean = false;
  userData$: Observable<UserDto | null>;
  userData: UserDto | null = null;

  isInstructor: boolean = false;
  isStudent: boolean = false;
  instructorId: number | null = null;

  studyContentOptions: { id: string; name: string }[] = [];
  meetingStudyContents: number[] = [];
  showUserInfoForm: boolean = false;

  showBanner = true;

  showBannerCuenca: boolean = false;
  showBannerCuencaComm: boolean = false;
  isCuenca: boolean = false;

  pendingAssessmentsCount: number = 0;
  showAssessmentAnnouncement: boolean = false;

  cuencaVideoUrl = "https://youtube.com/shorts/trxmLXdmBEQ?feature=share";
  generalVideoUrl = "https://youtube.com/shorts/Dgv94Lt-nck?feature=share";
  selectedVideoUrl: string | null = null;

  hasLiveClasses: boolean = false;

  constructor(
    private store: Store,
    private router: Router,
    private studyContentService: StudyContentService,
    private usersService: UsersService,
    private studentsService: StudentsService
  ) {
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
    this.userData$ = this.store.select(selectUserData);
  }

  ngOnInit() {
    this.isLoggedIn$.subscribe((state) => {
      this.isLoggedIn = state;
    });

    this.checkUserRoleAndFormVisibility();

    this.store.select(selectUserData).subscribe((userData: UserDto | null) => {
      if (userData && userData.instructor) {
        this.instructorId = userData.instructor.id;
      }
    });

    this.userData$.subscribe((user) => {
      this.userData = user;
      this.isInstructor = user?.role === UserRole.INSTRUCTOR;
      this.isStudent = user?.role === UserRole.STUDENT;
      this.isCuenca = (user?.city || '').toLowerCase() === 'cuenca';

      this.showBannerCuenca = this.isCuenca;
      this.showBannerCuencaComm = this.isCuenca;

      if (this.isCuenca) {
        this.selectedVideoUrl = this.cuencaVideoUrl;
      } else {
        this.selectedVideoUrl = this.generalVideoUrl;
      }

      // mostrar anuncio si inicia sesión y no lo ha visto antes
    if (this.isStudent && this.isLoggedIn && this.shouldShowAnnouncement()) {
      this.showAssessmentAnnouncement = true;
    }
    });

    
  }

  private checkUserRoleAndFormVisibility(): void {
    this.userData$.subscribe((user) => {
      if (!user) return;

      this.isInstructor = user.role === UserRole.INSTRUCTOR;
      this.isStudent = user.role === UserRole.STUDENT;

      const noBirthday = !user.birthday;
      const notCompleted = user.dataCompleted === false;

      const isMinor =
        user.role === UserRole.STUDENT &&
        !!user.birthday &&
        this.calculateAge(user.birthday) < 18;

      const missingTutorData =
        user.role === UserRole.STUDENT &&
        isMinor &&
        (!user.student?.tutorName ||
          !user.student?.tutorEmail ||
          !user.student?.tutorPhone);

      const needsForm = notCompleted || noBirthday || missingTutorData;

      this.showUserInfoForm = needsForm;
    });
  }

  /** Calcular edad */
  private calculateAge(dateStr: string): number {
    const birthDate = new Date(dateStr);
    if (isNaN(birthDate.getTime())) return 0;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  get studyContentNames(): string {
    if (this.studyContentOptions.length === 0)
      return 'Sin contenidos asignados';
    return this.studyContentOptions.map((c) => c.name).join('\n');
  }

  private loadStudyContentNames(contentIds: number[]) {
    this.studyContentOptions = [];

    if (contentIds.length > 0) {
      this.studyContentService
        .getManyStudyContents(contentIds)
        .subscribe((result) => {
          this.studyContentOptions = result.map((r) => ({
            id: r.stage.number,
            name: `Unidad ${r.unit}: ${r.title}`,
          }));
        });
    }
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
    this.userData$.pipe(take(1)).subscribe((user) => {
      if (!user?.id) {
        this.showModal(
          this.createModalParams(true, 'No se pudo obtener el ID del usuario.')
        );
        return;
      }

      const payload = this.buildUserPayload(data);
      this.updateUserProfile(user, payload, data);
    });
  }

  private buildUserPayload(data: any): any {
    return {
      emailAddress: data.email,
      birthday: data.birthday,
      contact: data.contact,
      city: data.city,
      country: data.country,
      occupation: data.occupation,
    };
  }

  private updateUserProfile(user: any, payload: any, data: any): void {
    this.usersService.update(user.id, payload).subscribe({
      next: () => {
        this.handleUserUpdateSuccess(user, payload);
        this.updateTutorInfoIfNeeded(user, data);
      },
      error: () => {
        this.showModal(
          this.createModalParams(
            true,
            'Ocurrió un error al actualizar la información.'
          )
        );
      },
    });
  }

  private handleUserUpdateSuccess(user: any, payload: any): void {
    this.showUserInfoForm = false;

    this.store.dispatch(updateUserData({ user: { ...user, ...payload } }));
    this.store.dispatch(setDataCompleted({ completed: true }));

    this.showModal(
      this.createModalParams(false, 'Información actualizada con éxito.')
    );
  }

  private updateTutorInfoIfNeeded(user: any, data: any): void {
    if (
      user.role === 'STUDENT' &&
      user.student?.id &&
      (data.tutorName || data.tutorEmail || data.tutorPhone)
    ) {
      const tutorPayload = {
        tutorName: data.tutorName || null,
        tutorEmail: data.tutorEmail || null,
        tutorPhone: data.tutorPhone || null,
      };

      this.updateTutorProfile(user.student.id, tutorPayload);
    }
  }

  private updateTutorProfile(studentId: number, tutorPayload: any): void {
    this.studentsService.updateStudentById(studentId, tutorPayload).subscribe({
      next: (updatedStudent) => {
        if (this.userData?.student) {
          this.store.dispatch(
            updateStudentData({
              student: { ...this.userData.student, ...updatedStudent },
            })
          );
        }

        this.showModal(
          this.createModalParams(
            false,
            'Datos del representante actualizados con éxito.'
          )
        );
      },
      error: () => {
        this.showModal(
          this.createModalParams(
            true,
            'Error al actualizar los datos del representante.'
          )
        );
      },
    });
  }

  showModal(params: ModalDto) {
    this.modal = { ...params };
    setTimeout(() => this.modal.close(), 2500);
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

  private shouldShowAnnouncement(): boolean {
    return !localStorage.getItem('assessment_announced');
  }

  goToBooking() {
    this.router.navigate(['/dashboard/booking']);
  }

  onAnnouncementClosed() {
    this.showAssessmentAnnouncement = false;
  }
}
