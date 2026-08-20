import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';

import { UserDto, UserRole } from '../../../services/dtos/user.dto';
import { Router } from '@angular/router';
import { StudentClassification } from '../../../services/dtos/student.dto';
import { InstructorCalendarComponent } from '../../../components/home/instructor-calendar/instructor-calendar.component';
import { AnnouncementViewerComponent } from '../../announcements/announcement-viewer/announcement-viewer.component';
import { Announcement } from '../../../services/dtos/announcement.dto';
import { AnnouncementService } from '../../../services/announcement.service';
import { InstructorSummaryCardComponent } from "./instructor-summary-card/instructor-summary-card.component";
import { InstructorQuickActionsComponent } from "./instructor-quick-actions/instructor-quick-actions.component";
import { InstructorUpcomingClassesComponent } from "./instructor-upcoming-classes/instructor-upcoming-classes.component";
import { InstructorDaySummaryComponent } from "./instructor-day-summary/instructor-day-summary.component";
import { InstructorWeeklyOverviewComponent } from "./instructor-weekly-overview/instructor-weekly-overview.component";
import { InstructorImportantNoticesComponent } from "./instructor-important-notices/instructor-important-notices.component";
import { InstructorRecentEmailsComponent } from "./instructor-recent-emails/instructor-recent-emails.component";
import { InstructorMonthlyPerformanceComponent } from "./instructor-monthly-performance/instructor-monthly-performance.component";

type AnnouncementViewerUser = {
  role?: UserRole;
  classification?: StudentClassification | null;
  city?: 'Portoviejo' | 'Cuenca' | null;
};

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    InstructorCalendarComponent,
    AnnouncementViewerComponent,
    InstructorSummaryCardComponent,
    InstructorQuickActionsComponent,
    InstructorUpcomingClassesComponent,
    InstructorDaySummaryComponent,
    InstructorWeeklyOverviewComponent,
    InstructorImportantNoticesComponent,
    InstructorRecentEmailsComponent,
    InstructorMonthlyPerformanceComponent
],
  templateUrl: './instructor-dashboard.component.html',
  styleUrl: './instructor-dashboard.component.scss',
})
export class InstructorDashboardComponent implements OnInit, OnChanges {
  @Input() userData: UserDto | null = null;
  @Input() isLoggedIn = false;

  readonly currentDate = new Date();

  instructorId: number | null = null;

  // ANUNCIOS
  announcements: Announcement[] = [];

  constructor(
    private readonly announcementService: AnnouncementService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.resolveInstructor();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userData']) {
      this.resolveInstructor();
    }
  }

  goToInstructorAgenda(): void {
    this.router.navigate([
      '/dashboard/searching-meeting-instructor-v2',
    ]);
  }

  private resolveInstructor(): void {
    if (!this.userData) {
      this.instructorId = null;
      return;
    }

    if (this.userData.role !== UserRole.INSTRUCTOR) {
      this.instructorId = null;
      return;
    }

    if (!this.userData.instructor) {
      this.instructorId = null;
      return;
    }

    this.instructorId = this.userData.instructor.id;

    this.loadAnnouncements();
  }

  private loadAnnouncements(): void {
    this.announcementService
      .getAnnouncementsForMe()
      .subscribe({
        next: (data: Announcement[]) => {
          this.announcements = data;
        },
        error: (error: unknown) => {
          console.error(
            'Error cargando anuncios del instructor',
            error
          );
        },
      });
  }

  get visibleAnnouncements(): Announcement[] {
    return this.filterByDisplayMode(this.announcements);
  }

  get announcementUser(): AnnouncementViewerUser | null {
    if (!this.userData) {
      return null;
    }

    let city: 'Portoviejo' | 'Cuenca' | null = null;

    if (this.userData.city === 'Portoviejo') {
      city = 'Portoviejo';
    } else if (this.userData.city === 'Cuenca') {
      city = 'Cuenca';
    }

    return {
      role: this.userData.role,
      classification: null,
      city,
    };
  }

  private filterByDisplayMode(
    list: Announcement[]
  ): Announcement[] {
    return list.filter((announcement) => {
      const key = `announcement_seen_${announcement.id}`;

      if (
        announcement.showMode === 'always' ||
        !announcement.showMode
      ) {
        return true;
      }

      if (announcement.showMode === 'once_session') {
        return !sessionStorage.getItem(key);
      }

      return true;
    });
  }

  private markAsSeen(announcement: Announcement): void {
    const key = `announcement_seen_${announcement.id}`;

    if (announcement.showMode === 'once_session') {
      sessionStorage.setItem(key, 'true');
    }
  }

  onCustomAnnouncementClosed(
    announcement: Announcement
  ): void {
    this.markAsSeen(announcement);
  }
}