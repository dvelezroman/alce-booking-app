import {
  Component,
  Input,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { Announcement, Action } from '../../../services/dtos/announcement.dto';
import { UserRole } from '../../../services/dtos/user.dto';
import { StudentClassification } from '../../../services/dtos/student.dto';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-announcement-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './announcement-viewer.component.html',
  styleUrl: './announcement-viewer.component.scss',
})
export class AnnouncementViewerComponent implements OnInit {

  @Input() announcements: Announcement[] = [];

  @Input() user!: {
    role?: UserRole;
    classification?: StudentClassification | null;
    city?: 'Portoviejo' | 'Cuenca' | null;
  };

  filtered: Announcement[] = [];
  currentIndex = 0;
  showModal = false;
  delayMap: boolean[] = [];

  // 🔥 YOUTUBE
  isYoutubeMedia = false;
  safeYoutubeUrl?: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {}

  // =========================
  // INIT
  // =========================
 ngOnInit(): void {

  console.log('USER 👉', this.user);
  console.log('ANNOUNCEMENTS 👉', this.announcements);

  this.filtered = this.filterAnnouncementsForUser(this.announcements);

  console.log('FILTERED 👉', this.filtered);

  if (this.filtered.length > 0) {
    this.currentIndex = 0;
    this.showModal = true;

    this.prepareMedia();
    this.startDelays(this.currentAnnouncement?.actions || []);
  }
}

  // =========================
  // CURRENT
  // =========================
  get currentAnnouncement(): Announcement | null {
    return this.filtered[this.currentIndex] || null;
  }

  // =========================
  // PREPARE MEDIA 🔥
  // =========================
  prepareMedia() {
    const media = this.currentAnnouncement?.mediaUrl;

    if (!media) {
      this.isYoutubeMedia = false;
      this.safeYoutubeUrl = undefined;
      return;
    }

    this.isYoutubeMedia =
      media.includes('youtube.com') ||
      media.includes('youtu.be');

    if (this.isYoutubeMedia) {
      this.safeYoutubeUrl = this.buildYoutubeUrl(media);
    } else {
      this.safeYoutubeUrl = undefined;
    }
  }

  // =========================
  // BUILD YOUTUBE
  // =========================
  private buildYoutubeUrl(url: string): SafeResourceUrl {
    let videoId = '';

    try {
      const u = new URL(url);

      if (u.hostname.includes('youtube.com')) {
        videoId = u.searchParams.get('v') || '';
      }

      if (u.hostname.includes('youtu.be')) {
        videoId = u.pathname.replace('/', '');
      }

    } catch (e) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  // =========================
  // FILTRO
  // =========================
  filterAnnouncementsForUser(list: Announcement[]): Announcement[] {

    const now = new Date();

    return list.filter(a => {

      if (!a.isActive) return false;

      if (a.startDate && new Date(a.startDate) > now) return false;
      if (a.endDate && new Date(a.endDate) < now) return false;

      // ROLE
      if (a.targetRole && this.user?.role && a.targetRole !== this.user.role) {
        return false;
      }

      // CLASSIFICATION
      if (
        a.targetStudentType &&
        this.user?.classification &&
        a.targetStudentType !== this.user.classification
      ) {
        return false;
      }

      // CITY
      if (a.city && this.user?.city) {
        const userCity = this.user.city.toLowerCase();
        const targetCity = a.city.toLowerCase();

        if (userCity !== targetCity) return false;
      }

      return true;
    });
  }

  // =========================
  // SIGUIENTE
  // =========================
  next() {
    this.currentIndex++;

    if (this.currentIndex >= this.filtered.length) {
      this.close();
      return;
    }

    this.prepareMedia();
    this.startDelays(this.currentAnnouncement?.actions || []);
  }

  // =========================
  // CERRAR
  // =========================
  close() {
    this.showModal = false;
  }

  // =========================
  // ACTIONS
  // =========================
  handleAction(action: Action) {

    if (action.type === 'close') {
      this.next();
      return;
    }

    if (action.type === 'action' && action.url) {
      window.open(action.url, '_blank');
    }

    if (action.type === 'whatsapp' && action.url) {
      window.open(action.url, '_blank');
    }
  }

  // =========================
  // DELAY 
  // =========================
  startDelays(actions: Action[]) {

    this.delayMap = [];

    actions.forEach((a, index) => {

      if (a.delaySeconds) {

        this.delayMap[index] = false;

        setTimeout(() => {
          this.delayMap[index] = true;
        }, a.delaySeconds * 1000);

      } else {
        this.delayMap[index] = true;
      }

    });
  }

  // =========================
  // DISABLED
  // =========================
  isDisabled(action: Action, index: number): boolean {
    if (!action.delaySeconds) return false;
    return !this.delayMap[index];
  }

  getButtonColor(action: Action): string {
    if (action.type === 'whatsapp') return '#25D366';
    return action.color || '#28336f';
  }
}