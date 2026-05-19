import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { UserDto, UserRole } from '../../../services/dtos/user.dto';

/* IMPORTAMOS LOS MOCKS */
import { ADMIN_STATS, ADMIN_MODULES, ADMIN_ANNOUNCEMENTS } from './admin-dashboard.mock';
import { DashboardNotificationsWidgetComponent } from "../../widgets-admin/dashboard-notifications-widget/dashboard-notifications-widget.component";
import { DashboardEmailsWidgetComponent } from "../../widgets-admin/dashboard-emails-widget/dashboard-emails-widget.component";
import { DashboardSettingsWidgetComponent } from "../../widgets-admin/dashboard-settings-widget/dashboard-settings-widget.component";
import { AnnouncementViewerComponent } from '../../announcements/announcement-viewer/announcement-viewer.component';
import { Announcement } from '../../../services/dtos/announcement.dto';
import { AnnouncementService } from '../../../services/announcement.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DashboardNotificationsWidgetComponent,
    // DashboardEmailsWidgetComponent,
    DashboardSettingsWidgetComponent,
    AnnouncementViewerComponent,
    
],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit, OnChanges {

  @Input() userData: UserDto | null = null;
  @Input() isLoggedIn = false;

  adminName = '';

  /* DATOS MOCK */
  stats = ADMIN_STATS;
  modules = ADMIN_MODULES;

  announcements: Announcement[] = [];

  constructor(private announcementService: AnnouncementService) {}

  ngOnInit(): void {
    this.resolveAdmin();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userData']) {
      this.resolveAdmin();
    }
  }

  loadAnnouncements() {
    this.announcementService.getAnnouncementsForMe().subscribe({
      next: (data) => {
        this.announcements = data;
      },
      error: (err) => {
        console.error('Error cargando anuncios admin', err);
      }
    });
  }

  private resolveAdmin(): void {
    if (!this.userData) return;
    if (this.userData.role !== UserRole.ADMIN) return;

    this.adminName = this.userData.firstName ?? 'Administrador';

    this.loadAnnouncements();
  }

  get visibleAnnouncements(): Announcement[] {
    return this.filterByDisplayMode(this.announcements);
  }

  get announcementUser() {
    if (!this.userData) return null;

    let city: 'Portoviejo' | 'Cuenca' | null = null;

    if (this.userData.city === 'Portoviejo') {
      city = 'Portoviejo';
    } else if (this.userData.city === 'Cuenca') {
      city = 'Cuenca';
    }

    return {
      role: this.userData.role,
      classification: null,
      city
    };
  }

  filterByDisplayMode(list: Announcement[]): Announcement[] {
    return list.filter(a => {

      const key = `announcement_seen_${a.id}`;

      // SIEMPRE
      if (a.showMode === 'always' || !a.showMode) {
        return true;
      }

      // UNA VEZ POR SESIÓN
      if (a.showMode === 'once_session') {
        return !sessionStorage.getItem(key);
      }

      return true;
    });
  }

  markAsSeen(a: Announcement) {
    const key = `announcement_seen_${a.id}`;

    if (a.showMode === 'once_session') {
      sessionStorage.setItem(key, 'true');
    }

  }

  onCustomAnnouncementClosed(a: Announcement) {
    this.markAsSeen(a);
  }

}