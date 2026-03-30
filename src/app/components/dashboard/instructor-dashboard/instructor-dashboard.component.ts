import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { UserDto, UserRole } from '../../../services/dtos/user.dto';
import { StudentClassification } from '../../../services/dtos/student.dto';
import { InstructorCalendarComponent } from '../../../components/home/instructor-calendar/instructor-calendar.component';
import { AnnouncementViewerComponent } from '../../announcements/announcement-viewer/announcement-viewer.component';
import { Announcement } from '../../../services/dtos/announcement.dto';
import { AnnouncementService } from '../../../services/announcement.service';


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
    AnnouncementViewerComponent
  ],
  templateUrl: './instructor-dashboard.component.html',
  styleUrl: './instructor-dashboard.component.scss',
})
export class InstructorDashboardComponent implements OnInit, OnChanges {

  @Input() userData: UserDto | null = null;
  @Input() isLoggedIn = false;

  instructorId: number | null = null;

  // ANUNCIOS
  announcements: Announcement[] = [];

  constructor(private announcementService: AnnouncementService) {}

  ngOnInit(): void {
    this.resolveInstructor();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userData']) {
      this.resolveInstructor();
    }
  }

  loadAnnouncements() {
    this.announcementService.getAnnouncementsForMe().subscribe({
      next: (data) => {
        this.announcements = data;
      },
      error: (err) => {
        console.error('Error cargando anuncios instructor', err);
      }
    });
  }

  private resolveInstructor(): void {
    if (!this.userData) return;
    if (this.userData.role !== UserRole.INSTRUCTOR) return;
    if (!this.userData.instructor) return;

    this.instructorId = this.userData.instructor.id;

    this.loadAnnouncements();
  }

  get visibleAnnouncements(): Announcement[] {
    return this.filterByDisplayMode(this.announcements);
  }

  // 🔥 USER PARA ANNOUNCEMENTS
  get announcementUser(): AnnouncementViewerUser | null {
    if (!this.userData) return null;

    let city: 'Portoviejo' | 'Cuenca' | null = null;

    if (this.userData.city === 'Portoviejo') {
      city = 'Portoviejo';
    } else if (this.userData.city === 'Cuenca') {
      city = 'Cuenca';
    }

    return {
      role: this.userData.role,
      classification: null, // instructor no usa esto
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