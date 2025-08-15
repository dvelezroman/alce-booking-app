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
import { GlobalNoticeBannerComponent } from "../../../components/global-notice-banner/global-notice-banner.component";

@Component({
  standalone: true,
  selector: 'app-dashboard-layout',
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    StudentBannerComponent,
    GlobalNoticeBannerComponent,
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
  isWarningBannerExpanded = true;
  isInfoBannerExpanded = true;
  hasAssessmentResources: boolean = false;
  modal: ModalDto = modalInitializer();

  constructor(
    private store: Store,
    private router: Router,
    private usersService: UsersService,
    private configService: AssessmentPointsConfigService
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
      this.hasAssessmentResources = this.checkAssessmentResources(this.userData);
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

  checkAssessmentResources(user: UserDto | null): boolean {
    return !!user?.assessmentResources && user.assessmentResources.length > 0;
  }

  get shouldShowAssessmentBanner(): boolean {
    return this.isLoggedIn &&
           this.userData?.role === UserRole.STUDENT &&
          (this.userData.assessmentResources?.length || 0) > 0;
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