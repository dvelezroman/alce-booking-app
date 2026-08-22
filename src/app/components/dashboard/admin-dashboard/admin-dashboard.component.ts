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

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DashboardNotificationsWidgetComponent,
    DashboardSettingsWidgetComponent,
    AnnouncementViewerComponent,
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

  constructor(
    private announcementService:
      AnnouncementService,

    private usersService:
      UsersService,
  ) {}


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {

    this.resolveAdmin();

    this.loadUserStats();
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
}