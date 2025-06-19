import { Router, RouterModule } from "@angular/router";
import { ModalComponent } from "../../../components/modal/modal.component";
import { SidebarComponent } from "../../../components/sidebar/sidebar.component";
import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { UsersService } from "../../../services/users.service";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { selectIsLoggedIn, selectIsRegistered, selectUserData } from "../../../store/user.selector";
import { UserDto, UserRole } from "../../../services/dtos/user.dto";
import { setInstructorLink } from "../../../store/user.action";
import { ModalDto, modalInitializer } from "../../../components/modal/modal.dto";
import { AssessmentPointsConfigService } from "../../../services/assessment-points-config.service";
import { StudentBannerComponent } from "../../../components/student-banner/student-banner.component";
import { AssessmentService } from "../../../services/assessment.service";
import { AssessementI } from "../../../services/dtos/assessment.dto";

@Component({
  standalone: true,
  selector: 'app-dashboard-layout',
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    StudentBannerComponent
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent implements OnInit {

  protected readonly UserRole = UserRole;

  isRegistered: boolean | undefined = false;
  isLoggedIn = false;
  isSidebarClosed = true;
  isLoggedIn$: Observable<boolean>;
  isRegistered$: Observable<boolean | undefined>;
  userData$: Observable<UserDto | null>;
  userData: UserDto | null = null;
  minHoursRequired: number | null = null;
  modal: ModalDto = modalInitializer();

  studentAssessments: AssessementI[] = [];
  showNoteBanner = false;

  constructor(
    private store: Store,
    private router: Router,
    private usersService: UsersService,
    private configService: AssessmentPointsConfigService,
    private assessmentService: AssessmentService
  ) {
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
    this.isRegistered$ = this.store.select(selectIsRegistered);
    this.userData$ = this.store.select(selectUserData);
  }

  ngOnInit(): void {
    this.isLoggedIn$.subscribe(state => {
      this.isLoggedIn = state;
    });

    this.userData$.subscribe(data => {
      this.userData = data;

      const studentId = this.userData?.student?.id;
      if (this.userData?.role === UserRole.STUDENT && studentId) {
        this.fetchStudentAssessments(studentId);
      }
    });

    const savedLink = localStorage.getItem('instructorLink');
    if (savedLink) {
      this.store.dispatch(setInstructorLink({ link: savedLink }));
    }

    this.isRegistered$.subscribe(state => {
      this.isRegistered = state;
      if (this.isLoggedIn && !this.isRegistered) {
        this.router.navigate(['/dashboard/register-complete']);
      }
    });

    this.loadMinHoursRequired();
  }

  fetchStudentAssessments(studentId: number): void {
    this.assessmentService.findAll({ studentId: studentId.toString() }).subscribe({
      next: (assessments) => {
        this.studentAssessments = assessments;

        // Mostrar banner si hay al menos una nota o recursos
        this.showNoteBanner = assessments.some(
          a => !!a.note || (a.resources && a.resources.length > 0)
        );

        console.log('Evaluaciones del estudiante:', assessments);
      },
      error: () => {
        console.error('Error al obtener las evaluaciones del estudiante.');
      }
    });
  }

  get shouldShowAssessmentBanner(): boolean {
    return this.isLoggedIn &&
           this.userData?.role === UserRole.STUDENT &&
           this.showNoteBanner;
  }

  loadMinHoursRequired(): void {
    this.configService.getById().subscribe(config => {
      this.minHoursRequired = config.minHoursScheduled;
    });
  }

  toggleSidebar() {
    this.isSidebarClosed = !this.isSidebarClosed;
  }

  onConfirmLogout() {
    this.usersService.logout();
    this.router.navigate(['/login']);
  }
}