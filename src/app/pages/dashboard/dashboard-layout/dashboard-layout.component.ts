import { Router, RouterModule } from "@angular/router";
import { SidebarComponent } from "../../../components/sidebar/sidebar.component";
import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { UsersService } from "../../../services/users.service";
import { Store } from "@ngrx/store";
import { combineLatest, filter, interval, map, Observable, Subscription } from "rxjs";
import { NavigationEnd } from "@angular/router";
import { selectIsLoggedIn, selectIsRegistered, selectUserData } from "../../../store/user.selector";
import { UserDto, UserRole } from "../../../services/dtos/user.dto";
import { setInstructorLink } from "../../../store/user.action";
import { ModalDto, modalInitializer } from "../../../components/modal/modal.dto";
import { AssessmentPointsConfigService } from "../../../services/assessment-points-config.service";
import { StudentBannerComponent } from "../../../components/student-banner/student-banner.component";
import { GlobalNoticeBannerComponent } from "../../../components/home/global-notice-banner/global-notice-banner.component";
import { NotificationService } from "../../../services/notification.service";
import { UnreadBannerComponent } from "../../../components/banner/unread-banner/unread-banner.component";
import { NotificationPermissionComponent } from "../../../components/notification-permission/notification-permission.component";
import { PwaInstallBannerComponent } from "../../../components/pwa-install-banner/pwa-install-banner.component";
import { PwaInstallComponent } from "../../../components/pwa-install/pwa-install.component";
import { PushNotificationService } from "../../../services/push-notification.service";
import { HeaderComponent } from "../../../components/header/header.component";
import { LeadSchedulingPendingCountService } from "../../../services/lead-scheduling-pending-count.service";
import { LeadSchedulingPendingBannerComponent } from "../../../components/banner/lead-scheduling-pending-banner/lead-scheduling-pending-banner.component";

@Component({
  standalone: true,
  selector: 'app-dashboard-layout',
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    UnreadBannerComponent,
    StudentBannerComponent,
    // GlobalNoticeBannerComponent,
    NotificationPermissionComponent,
    PwaInstallComponent,
    PwaInstallBannerComponent,
    HeaderComponent,
    LeadSchedulingPendingBannerComponent,
],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {

  unreadCount$!: Observable<number>;
  leadSchedulingPendingCount$!: Observable<number>;

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
  /** Se incrementa en cada ingreso de sesión (login o recarga) para mostrar el toast. */
  leadSchedulingToastToken = 0;
  private readonly subs = new Subscription();
  private wasLoggedIn = false;
  private pendingSessionLeadToast = false;

  constructor(
    private store: Store,
    private router: Router,
    private usersService: UsersService,
    private notificationService: NotificationService,
    private configService: AssessmentPointsConfigService,
    private pushNotificationService: PushNotificationService,
    private leadSchedulingPending: LeadSchedulingPendingCountService,
  ) {
        this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
        this.isRegistered$ = this.store.select(selectIsRegistered);
        this.userData$ = this.store.select(selectUserData);
  }

  ngOnInit(): void {
    this.unreadCount$ = this.notificationService.unreadCount$;
    this.leadSchedulingPendingCount$ = combineLatest([
      this.userData$,
      this.leadSchedulingPending.adminPending$,
      this.leadSchedulingPending.instructorPending$,
    ]).pipe(
      map(([user, adminCount, instructorCount]) => {
        if (user?.role === UserRole.ADMIN) return adminCount;
        if (user?.role === UserRole.INSTRUCTOR) return instructorCount;
        return 0;
      }),
    );

    this.isLoggedIn$.subscribe(async (state) => {
      const loginTransition = state && !this.wasLoggedIn;
      this.isLoggedIn = state;
      this.wasLoggedIn = state;

      if (state) {
        this.notificationService.loadUnreadCount().subscribe();
        if (loginTransition) {
          this.pendingSessionLeadToast = true;
        }
        this.refreshLeadSchedulingPendingCount(false);
        await this.pushNotificationService.ensureInstalledPwaPushSubscription();
        const hasSubscription = await this.pushNotificationService.hasActiveSubscription();
        const permission =
          typeof Notification !== 'undefined' ? Notification.permission : 'default';
        this.showNotificationBanner =
          this.pushNotificationService.isPreferenceEnabled() &&
          !hasSubscription &&
          permission !== 'denied' &&
          !this.pushNotificationService.isBannerDismissed();
      } else {
        this.pendingSessionLeadToast = false;
        this.leadSchedulingPending.reset();
      }
    });

    this.userData$.subscribe(data => {
      this.userData = data;
      this.hasAssessmentResources = this.checkAssessmentResources(this.userData);
      if (data) {
        this.notificationService.loadUnreadCount().subscribe();
        if (this.pendingSessionLeadToast) {
          this.triggerLeadSchedulingSessionToast(data.role);
        } else {
          this.refreshLeadSchedulingPendingCount(false);
        }
      }
    });

    this.subs.add(
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(() => this.refreshLeadSchedulingPendingCount(false)),
    );

    this.subs.add(
      interval(5 * 60 * 1000).subscribe(() => this.refreshLeadSchedulingPendingCount(false)),
    );

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

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private refreshLeadSchedulingPendingCount(showSessionToast: boolean): void {
    if (!this.isLoggedIn) return;
    const role = this.userData?.role;
    if (role !== UserRole.ADMIN && role !== UserRole.INSTRUCTOR) return;

    this.leadSchedulingPending.refresh(role).subscribe(() => {
      if (showSessionToast && this.leadSchedulingPending.getCountForRole(role) > 0) {
        this.leadSchedulingToastToken += 1;
      }
    });
  }

  private triggerLeadSchedulingSessionToast(role: UserRole | undefined): void {
    this.pendingSessionLeadToast = false;
    if (role !== UserRole.ADMIN && role !== UserRole.INSTRUCTOR) return;
    this.refreshLeadSchedulingPendingCount(true);
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
