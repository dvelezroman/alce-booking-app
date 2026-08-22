import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import {
  UserDto,
  UserRole,
} from '../../../services/dtos/user.dto';

import {
  UsersService,
} from '../../../services/users.service';

import {
  ADMIN_MODULES,
} from './admin-dashboard.mock';

import {
  DashboardNotificationsWidgetComponent,
} from '../../widgets-admin/dashboard-notifications-widget/dashboard-notifications-widget.component';

import {
  DashboardSettingsWidgetComponent,
} from '../../widgets-admin/dashboard-settings-widget/dashboard-settings-widget.component';

import {
  AnnouncementViewerComponent,
} from '../../announcements/announcement-viewer/announcement-viewer.component';

import {
  Announcement,
} from '../../../services/dtos/announcement.dto';

import {
  AnnouncementService,
} from '../../../services/announcement.service';


/* =========================
   DASHBOARD COMPONENTS
========================= */


import {
  AdminDashboardShortcutsComponent,
} from '../../../components/dashboard/admin-dashboard-components/admin-dashboard-shortcuts/admin-dashboard-shortcuts.component';

import {
  AdminDashboardPendingDemosComponent,
} from '../../../components/dashboard/admin-dashboard-components/admin-dashboard-pending-demos/admin-dashboard-pending-demos.component';

import {
  AdminDashboardQuickActionsComponent,
} from '../../../components/dashboard/admin-dashboard-components/admin-dashboard-quick-actions/admin-dashboard-quick-actions.component';

import {
  AdminDashboardDaySummaryComponent,
} from '../../../components/dashboard/admin-dashboard-components/admin-dashboard-day-summary/admin-dashboard-day-summary.component';

import {
  AdminDashboardNotificationsComponent,
} from '../../../components/dashboard/admin-dashboard-components/admin-dashboard-notifications/admin-dashboard-notifications.component';

import {
  AdminDashboardTipComponent,
} from '../../../components/dashboard/admin-dashboard-components/admin-dashboard-tip/admin-dashboard-tip.component';
import { AdminDashboardStatsComponent } from '../admin-dashboard-components/admin-dashboard-stats/admin-dashboard-stats.component';
import { BookingService } from '../../../services/booking.service';
import { FilterMeetingsDto } from '../../../services/dtos/booking.dto';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    DashboardNotificationsWidgetComponent,
    DashboardSettingsWidgetComponent,
    AnnouncementViewerComponent,

    AdminDashboardStatsComponent,
    AdminDashboardShortcutsComponent,
    AdminDashboardPendingDemosComponent,
    AdminDashboardQuickActionsComponent,
    AdminDashboardDaySummaryComponent,
    AdminDashboardNotificationsComponent,
    AdminDashboardTipComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent
  implements OnInit, OnChanges {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  userData: UserDto | null = null;

  @Input()
  isLoggedIn = false;


  /* =========================
     ADMIN
  ========================= */

  adminName = '';


  /* =========================
     USER STATS
  ========================= */

  totalUsers = 0;
  totalStudents = 0;
  totalInstructors = 0;
  totalAdmins = 0;
  loadingUserStats = false;

  /* =========================
    MEETING STATS
  ========================= */
  pendingClassesToAssign = 0;
  loadingPendingClasses = false;

  /* =========================
     MODULES
  ========================= */

  modules = ADMIN_MODULES;


  /* =========================
     ANNOUNCEMENTS
  ========================= */

  announcements: Announcement[] = [];


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor( private announcementService:
      AnnouncementService,

    private usersService:
      UsersService,

    private bookingService:
      BookingService,
  ) {}


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.resolveAdmin();
    this.loadUserStats();
    this.loadPendingMeetings();
  }


  /* =========================
     CHANGES
  ========================= */

  ngOnChanges(
    changes: SimpleChanges,
  ): void {

    if (
      changes['userData']
    ) {
      this.resolveAdmin();
    }
  }

  /* =========================
    PENDING MEETINGS
  ========================= */

  private loadPendingMeetings(): void {

    this.loadingPendingClasses = true;

    const today =
      this.getTodayDate();

    const filter:
      FilterMeetingsDto = {
        from: today,
        to: today,
        assigned: false,
      };

    this.bookingService
      .searchMeetings(filter)
      .subscribe({

        next: (meetings) => {

          this.pendingClassesToAssign =
            meetings.length;

          this.loadingPendingClasses =
            false;
        },

        error: (error) => {

          console.error(
            'Error al obtener clases pendientes de asignación:',
            error,
          );

          this.pendingClassesToAssign = 0;
          this.loadingPendingClasses = false;
        },
      });
  }


  /* =========================
     USER STATS
  ========================= */

  private loadUserStats(): void {

    this.loadingUserStats = true;

    this.loadTotalUsers();

    this.loadUsersByRole(
      UserRole.STUDENT,
      'student',
    );

    this.loadUsersByRole(
      UserRole.INSTRUCTOR,
      'instructor',
    );

    this.loadUsersByRole(
      UserRole.ADMIN,
      'admin',
    );
  }


  private loadTotalUsers(): void {

    this.usersService
      .searchUsers(
        undefined,
        1,
      )
      .subscribe({
        next: (response) => {

          this.totalUsers =
            response.total ?? 0;
        },

        error: (error) => {

          console.error(
            'Error al obtener total de usuarios:',
            error,
          );

          this.totalUsers = 0;
        },
      });
  }


  private loadUsersByRole(
    role: UserRole,
    type:
      | 'student'
      | 'instructor'
      | 'admin',
  ): void {

    this.usersService
      .searchUsers(
        undefined, // page
        1,         // limit
        undefined, // email
        '',        // firstName
        '',        // lastName
        undefined, // status
        role,      // role
        true,      // register
        undefined, // stageId
      )
      .subscribe({
        next: (response) => {

          const total =
            response.total ?? 0;

          switch (type) {

            case 'student':
              this.totalStudents =
                total;
              break;

            case 'instructor':
              this.totalInstructors =
                total;
              break;

            case 'admin':
              this.totalAdmins =
                total;
              break;
          }

          this.updateUserStatsLoading();
        },

        error: (error) => {

          console.error(
            `Error al obtener usuarios por rol ${role}:`,
            error,
          );

          switch (type) {

            case 'student':
              this.totalStudents = 0;
              break;

            case 'instructor':
              this.totalInstructors = 0;
              break;

            case 'admin':
              this.totalAdmins = 0;
              break;
          }

          this.updateUserStatsLoading();
        },
      });
  }


  private updateUserStatsLoading(): void {

    this.loadingUserStats =
      false;
  }


  /* =========================
     ANNOUNCEMENTS
  ========================= */

  loadAnnouncements(): void {

    this.announcementService
      .getAnnouncementsForMe()
      .subscribe({
        next: (data) => {

          this.announcements =
            data;
        },

        error: (err) => {

          console.error(
            'Error cargando anuncios admin',
            err,
          );
        },
      });
  }


  /* =========================
     ADMIN
  ========================= */

  private resolveAdmin(): void {

    if (!this.userData) {
      return;
    }

    if (
      this.userData.role !==
      UserRole.ADMIN
    ) {
      return;
    }

    this.adminName =
      this.userData.firstName ??
      'Administrador';

    this.loadAnnouncements();
  }


  /* =========================
     VISIBLE ANNOUNCEMENTS
  ========================= */

  get visibleAnnouncements():
    Announcement[] {

    return this.filterByDisplayMode(
      this.announcements,
    );
  }


  /* =========================
     ANNOUNCEMENT USER
  ========================= */

  get announcementUser() {

    if (!this.userData) {
      return null;
    }

    let city:
      | 'Portoviejo'
      | 'Cuenca'
      | null = null;

    if (
      this.userData.city ===
      'Portoviejo'
    ) {
      city = 'Portoviejo';
    }

    else if (
      this.userData.city ===
      'Cuenca'
    ) {
      city = 'Cuenca';
    }

    return {
      role:
        this.userData.role,

      classification:
        null,

      city,
    };
  }


  /* =========================
     DISPLAY MODE
  ========================= */

  filterByDisplayMode(
    list: Announcement[],
  ): Announcement[] {

    return list.filter(
      announcement => {

        const key =
          `announcement_seen_${announcement.id}`;

        if (
          announcement.showMode ===
            'always' ||
          !announcement.showMode
        ) {
          return true;
        }

        if (
          announcement.showMode ===
          'once_session'
        ) {
          return (
            !sessionStorage
              .getItem(key)
          );
        }

        return true;
      },
    );
  }


  /* =========================
     SEEN
  ========================= */

  markAsSeen(
    announcement: Announcement,
  ): void {

    const key =
      `announcement_seen_${announcement.id}`;

    if (
      announcement.showMode ===
      'once_session'
    ) {
      sessionStorage.setItem(
        key,
        'true',
      );
    }
  }


  onCustomAnnouncementClosed(
    announcement: Announcement,
  ): void {

    this.markAsSeen(
      announcement,
    );
  }

  private getTodayDate(): string {

    return new Date()
      .toISOString()
      .split('T')[0];
  }
}