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
import { ADMIN_STATS, ADMIN_MODULES } from './admin-dashboard.mock';
import { DashboardNotificationsWidgetComponent } from "../../widgets-admin/dashboard-notifications-widget/dashboard-notifications-widget.component";
import { DashboardEmailsWidgetComponent } from "../../widgets-admin/dashboard-emails-widget/dashboard-emails-widget.component";
import { DashboardWhatsappWidgetComponent } from "../../widgets-admin/dashboard-whatsapp-widget/dashboard-whatsapp-widget.component";
import { DashboardSettingsWidgetComponent } from "../../widgets-admin/dashboard-settings-widget/dashboard-settings-widget.component";

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DashboardNotificationsWidgetComponent,
    DashboardEmailsWidgetComponent,
    DashboardWhatsappWidgetComponent,
    DashboardSettingsWidgetComponent
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

  ngOnInit(): void {
    this.resolveAdmin();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userData']) {
      this.resolveAdmin();
    }
  }

  private resolveAdmin(): void {
    if (!this.userData) return;
    if (this.userData.role !== UserRole.ADMIN) return;

    this.adminName = this.userData.firstName ?? 'Administrador';
  }

}