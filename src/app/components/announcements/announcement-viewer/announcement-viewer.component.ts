import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
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

  @Output() closed = new EventEmitter<Announcement>();

  filtered: Announcement[] = [];
  currentIndex = 0;
  showModal = false;
  delayMap: boolean[] = [];

  // YOUTUBE
  isYoutubeMedia = false;
  safeYoutubeUrl?: SafeResourceUrl;

  delaySecondsMap: number[] = [];
  videoStarted = false;
  hasVideoStarted = false;

  constructor(private sanitizer: DomSanitizer) {}

  // =========================
  // INIT
  // =========================
  ngOnInit(): void {

    this.filtered = this
      .filterAnnouncementsForUser(this.announcements)
      .sort((a, b) => {
        const isAImage = !(a.mediaUrl.includes('youtube') || a.mediaUrl.includes('youtu.be'));
        const isBImage = !(b.mediaUrl.includes('youtube') || b.mediaUrl.includes('youtu.be'));

        // imágenes primero
        if (isAImage && !isBImage) return -1;
        if (!isAImage && isBImage) return 1;

        return 0;
      });

    if (this.filtered.length > 0) {
      this.currentIndex = 0;
      this.showModal = true;

      this.prepareMedia();

      if (!this.isYoutubeMedia) {
        this.startDelays(this.currentAnnouncement?.actions || []);
      }
    }
  }

  // =========================
  // CURRENT
  // =========================
  get currentAnnouncement(): Announcement | null {
    return this.filtered[this.currentIndex] || null;
  }

  private getStorageKey(a: Announcement): string {
    const userId = this.user?.role ? this.user.role : 'anon';
    return `announcement_seen_${userId}_${a.id}`;
  }

  // 🔥 FILTRAMOS ACTIONS (CLAVE)
  get visibleActions(): Action[] {
    return this.currentAnnouncement?.actions.filter(a => a.type !== 'close') || [];
  }

  get closeAction(): Action | null {
    return this.currentAnnouncement?.actions.find(a => a.type === 'close') || null;
  }

  getActionIndex(action: Action | null): number {
    if (!action) return -1;
    return this.currentAnnouncement?.actions.indexOf(action) ?? -1;
  }

  getCloseDelay(): number {
    const action = this.closeAction;
    const index = this.getActionIndex(action);

    if (index === -1) return 0;

    return this.delaySecondsMap[index] ?? 0;
  }

  // =========================
  // PREPARE MEDIA
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

      if (a.targetRole && this.user?.role && a.targetRole !== this.user.role) {
        return false;
      }

      if (
        a.targetStudentType &&
        this.user?.classification &&
        a.targetStudentType !== this.user.classification
      ) {
        return false;
      }

      if (a.city && this.user?.city) {
        const userCity = this.user.city.toLowerCase();
        const targetCity = a.city.toLowerCase();
        if (userCity !== targetCity) return false;
      }

      if (a.showMode === 'once_user') {
        const key = this.getStorageKey(a);
        if (localStorage.getItem(key)) return false;
      }

      return true;
    });
  }

  // =========================
  // VIDEO EMPIEZA
  // =========================
  playVideo() {
    if (this.videoStarted) return;

    this.videoStarted = true;

    const media = this.currentAnnouncement?.mediaUrl;

    if (media && this.isYoutubeMedia) {
      // extraemos ID y forzamos autoplay
      let videoId = '';

      try {
        const u = new URL(media);

        if (u.hostname.includes('youtube.com')) {
          videoId = u.searchParams.get('v') || '';
        }

        if (u.hostname.includes('youtu.be')) {
          videoId = u.pathname.replace('/', '');
        }

      } catch (e) {}

      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

      this.safeYoutubeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }

    this.onVideoPlay();
  }

    onVideoPlay() {
    if (this.hasVideoStarted) return;

    this.hasVideoStarted = true;

    this.startDelays(this.currentAnnouncement?.actions || []);
  }

  // =========================
  // NEXT
  // =========================
  next() {
    const current = this.currentAnnouncement;

    if (current) {
      
      //...guardar si es once_user
      if (current.showMode === 'once_user') {
      const key = this.getStorageKey(current);
      localStorage.setItem(key, 'true');
    }

      this.closed.emit(current);
    }

    this.currentIndex++;

    if (this.currentIndex >= this.filtered.length) {
      this.showModal = false;
      return;
    }

    this.prepareMedia();
    this.delayMap = [];
    this.delaySecondsMap = [];
    this.hasVideoStarted = false;
    this.videoStarted = false;

    // SI ES IMAGEN → delay inmediato
    if (!this.isYoutubeMedia) {
      this.startDelays(this.currentAnnouncement?.actions || []);
    } else {
      // SI ES VIDEO → botones empiezan deshabilitados
      const actions = this.currentAnnouncement?.actions || [];

      actions.forEach((a, index) => {
        if (a.delaySeconds && a.delaySeconds > 0) {
          this.delayMap[index] = false;
          this.delaySecondsMap[index] = a.delaySeconds;
        } else {
          this.delayMap[index] = true;
        }
      });
    }
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
    this.delaySecondsMap = [];

    actions.forEach((a, index) => {

      if (a.delaySeconds && a.delaySeconds > 0) {

        this.delayMap[index] = false;
        this.delaySecondsMap[index] = a.delaySeconds;

        const interval = setInterval(() => {
          this.delaySecondsMap[index]--;

          if (this.delaySecondsMap[index] <= 0) {
            this.delayMap[index] = true;
            clearInterval(interval);
          }
        }, 1000);

      } else {
        this.delayMap[index] = true;
      }

    });
  }

  isVideoLocked(): boolean {
    if (!this.hasVideoStarted) return false;

    const actions = this.currentAnnouncement?.actions || [];

    return actions.some((a, i) => 
      a.delaySeconds && !this.delayMap[i]
    );
  }

  isDisabled(action: Action, index: number): boolean {
    if (!action.delaySeconds) return false;
    return !this.delayMap[index];
  }

  // =========================
  // CLOSE
  // =========================
  close() {
    this.next();
  }

  getButtonColor(action: Action): string {
    if (action.type === 'whatsapp') return '#25D366';
    return action.color || '#28336f';
  }
}