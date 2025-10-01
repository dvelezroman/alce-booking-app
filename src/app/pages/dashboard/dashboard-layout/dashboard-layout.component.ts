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
import { NotificationService } from "../../../services/notification.service";
import { UnreadBannerComponent } from "../../../components/banner/unread-banner/unread-banner.component";
import { NotificationPermissionComponent } from "../../../components/notification-permission/notification-permission.component";
import { PwaInstallBannerComponent } from "../../../components/pwa-install-banner/pwa-install-banner.component";
import { PwaInstallComponent } from "../../../components/pwa-install/pwa-install.component";
import { PushNotificationService } from "../../../services/push-notification.service";
import { MaintenanceAnnouncementComponent } from "../../../components/maintenance-announcement/maintenance-announcement.component";

@Component({
  standalone: true,
  selector: 'app-dashboard-layout',
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    UnreadBannerComponent,
    StudentBannerComponent,
    GlobalNoticeBannerComponent,
    NotificationPermissionComponent,
    PwaInstallComponent,
    PwaInstallBannerComponent,
    MaintenanceAnnouncementComponent,
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent implements OnInit {

  unreadCount$!: Observable<number>;

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

  showNotificationBanner = false;

  constructor(
    private store: Store,
    private router: Router,
    private usersService: UsersService,
    private notificationService: NotificationService,
    private configService: AssessmentPointsConfigService,
    private pushNotificationService: PushNotificationService
  ) {
        this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
        this.isRegistered$ = this.store.select(selectIsRegistered);
        this.userData$ = this.store.select(selectUserData);
  }
  
  ngOnInit(): void {
    this.unreadCount$ = this.notificationService.unreadCount$;

    this.isLoggedIn$.subscribe(async (state) => {
      this.isLoggedIn = state;
      if (state) {
        this.notificationService.loadUnreadCount().subscribe();
        const hasSubscription = await this.pushNotificationService.hasActiveSubscription();
        this.showNotificationBanner = !hasSubscription;
      }
    });

    this.userData$.subscribe(data => {
      this.userData = data;
      this.hasAssessmentResources = this.checkAssessmentResources(this.userData);
      if (data) {
        this.notificationService.loadUnreadCount().subscribe();
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