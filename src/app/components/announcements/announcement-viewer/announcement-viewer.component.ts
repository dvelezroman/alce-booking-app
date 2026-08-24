import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';

import {
  Action,
  Announcement,
} from '../../../services/dtos/announcement.dto';
import { UserRole } from '../../../services/dtos/user.dto';
import { StudentClassification } from '../../../services/dtos/student.dto';

type AnnouncementMediaType =
  | 'image'
  | 'youtube'
  | 'google-drive'
  | 'video'
  | 'none';

@Component({
  selector: 'app-announcement-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl:
    './announcement-viewer.component.html',
  styleUrl:
    './announcement-viewer.component.scss',
})
export class AnnouncementViewerComponent
  implements OnInit
{
  @Input() announcements: Announcement[] = [];

  @Input() user!: {
    role?: UserRole;
    classification?: StudentClassification | null;
    city?: 'Portoviejo' | 'Cuenca' | null;
  };

  @Output() closed =
    new EventEmitter<Announcement>();

  /** Fires when queue empty or user finished all items (modal closed). */
  @Output() finished = new EventEmitter<void>();

  filtered: Announcement[] = [];
  currentIndex = 0;
  showModal = false;

  delayMap: boolean[] = [];
  delaySecondsMap: number[] = [];

  mediaType: AnnouncementMediaType = 'none';
  safeEmbedUrl?: SafeResourceUrl;

  videoStarted = false;
  hasVideoStarted = false;

  constructor(
    private sanitizer: DomSanitizer
  ) {}

  // =========================
  // INIT
  // =========================
  ngOnInit(): void {
    this.filtered = this
      .filterAnnouncementsForUser(
        this.announcements
      )
      .sort((a, b) => {
        const aIsImage =
          this.detectMediaType(a.mediaUrl) ===
          'image';

        const bIsImage =
          this.detectMediaType(b.mediaUrl) ===
          'image';

        // Imágenes primero
        if (aIsImage && !bIsImage) {
          return -1;
        }

        if (!aIsImage && bIsImage) {
          return 1;
        }

        return 0;
      });

    if (this.filtered.length === 0) {
      this.finished.emit();
      return;
    }

    this.currentIndex = 0;
    this.showModal = true;

    this.prepareMedia();
    this.prepareCurrentActions();
  }

  // =========================
  // CURRENT
  // =========================
  get currentAnnouncement():
    | Announcement
    | null {
    return (
      this.filtered[this.currentIndex] ||
      null
    );
  }

  get isYoutubeMedia(): boolean {
    return this.mediaType === 'youtube';
  }

  get isGoogleDriveMedia(): boolean {
    return (
      this.mediaType === 'google-drive'
    );
  }

  get isDirectVideoMedia(): boolean {
    return this.mediaType === 'video';
  }

  get isImageMedia(): boolean {
    return this.mediaType === 'image';
  }

  get isEmbeddedVideo(): boolean {
    return (
      this.isYoutubeMedia ||
      this.isGoogleDriveMedia
    );
  }

  private getStorageKey(
    announcement: Announcement
  ): string {
    const userId =
      this.user?.role || 'anon';

    return `announcement_seen_${userId}_${announcement.id}`;
  }

  get visibleActions(): Action[] {
    return (
      this.currentAnnouncement?.actions.filter(
        (action) =>
          action.type !== 'close'
      ) || []
    );
  }

  get closeAction(): Action | null {
    return (
      this.currentAnnouncement?.actions.find(
        (action) =>
          action.type === 'close'
      ) || null
    );
  }

  getActionIndex(
    action: Action | null
  ): number {
    if (!action) {
      return -1;
    }

    return (
      this.currentAnnouncement?.actions.indexOf(
        action
      ) ?? -1
    );
  }

  getCloseDelay(): number {
    const index = this.getActionIndex(
      this.closeAction
    );

    if (index === -1) {
      return 0;
    }

    return (
      this.delaySecondsMap[index] ?? 0
    );
  }

  // =========================
  // PREPARE MEDIA
  // =========================
  prepareMedia(): void {
    this.mediaType = 'none';
    this.safeEmbedUrl = undefined;

    const mediaUrl =
      this.currentAnnouncement?.mediaUrl?.trim();

    if (!mediaUrl) {
      return;
    }

    this.mediaType =
      this.detectMediaType(mediaUrl);

    if (this.isYoutubeMedia) {
      this.safeEmbedUrl =
        this.buildYoutubeUrl(mediaUrl);

      return;
    }

    if (this.isGoogleDriveMedia) {
      this.safeEmbedUrl =
        this.buildGoogleDriveUrl(mediaUrl);
    }
  }

  private detectMediaType(
    url?: string
  ): AnnouncementMediaType {
    const mediaUrl = url?.trim();

    if (!mediaUrl) {
      return 'none';
    }

    if (this.isYoutubeUrl(mediaUrl)) {
      return 'youtube';
    }

    if (
      this.isGoogleDriveUrl(mediaUrl)
    ) {
      return 'google-drive';
    }

    if (
      this.isDirectVideoUrl(mediaUrl)
    ) {
      return 'video';
    }

    return 'image';
  }

  private isYoutubeUrl(
    url: string
  ): boolean {
    try {
      const parsedUrl = new URL(url);
      const hostname =
        parsedUrl.hostname.toLowerCase();

      return (
        hostname === 'youtube.com' ||
        hostname === 'www.youtube.com' ||
        hostname === 'm.youtube.com' ||
        hostname === 'youtu.be' ||
        hostname === 'www.youtu.be'
      );
    } catch {
      return false;
    }
  }

  private isGoogleDriveUrl(
    url: string
  ): boolean {
    try {
      const parsedUrl = new URL(url);
      const hostname =
        parsedUrl.hostname.toLowerCase();

      return (
        hostname === 'drive.google.com' ||
        hostname.endsWith(
          '.drive.google.com'
        )
      );
    } catch {
      return false;
    }
  }

  private isDirectVideoUrl(
    url: string
  ): boolean {
    return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(
      url
    );
  }

  // =========================
  // YOUTUBE
  // =========================
  private buildYoutubeUrl(
    url: string,
    autoplay = false
  ): SafeResourceUrl | undefined {
    const videoId =
      this.extractYoutubeVideoId(url);

    if (!videoId) {
      return undefined;
    }

    const autoplayValue = autoplay
      ? '1'
      : '0';

    const embedUrl =
      `https://www.youtube.com/embed/${videoId}` +
      `?autoplay=${autoplayValue}&rel=0`;

    return this.sanitizer
      .bypassSecurityTrustResourceUrl(
        embedUrl
      );
  }

  private extractYoutubeVideoId(
    url: string
  ): string | null {
    try {
      const parsedUrl = new URL(url);
      const hostname =
        parsedUrl.hostname.toLowerCase();

      if (
        hostname === 'youtu.be' ||
        hostname === 'www.youtu.be'
      ) {
        return (
          parsedUrl.pathname
            .split('/')
            .filter(Boolean)[0] || null
        );
      }

      const queryVideoId =
        parsedUrl.searchParams.get('v');

      if (queryVideoId) {
        return queryVideoId;
      }

      const pathParts =
        parsedUrl.pathname
          .split('/')
          .filter(Boolean);

      const embedIndex =
        pathParts.indexOf('embed');

      if (
        embedIndex >= 0 &&
        pathParts[embedIndex + 1]
      ) {
        return pathParts[
          embedIndex + 1
        ];
      }

      const shortsIndex =
        pathParts.indexOf('shorts');

      if (
        shortsIndex >= 0 &&
        pathParts[shortsIndex + 1]
      ) {
        return pathParts[
          shortsIndex + 1
        ];
      }

      return null;
    } catch {
      return null;
    }
  }

  // =========================
  // GOOGLE DRIVE
  // =========================
  private buildGoogleDriveUrl(
    url: string
  ): SafeResourceUrl | undefined {
    const fileId =
      this.extractGoogleDriveFileId(url);

    if (!fileId) {
      return undefined;
    }

    const previewUrl =
      `https://drive.google.com/file/d/${fileId}/preview`;

    return this.sanitizer
      .bypassSecurityTrustResourceUrl(
        previewUrl
      );
  }

  private extractGoogleDriveFileId(
    url: string
  ): string | null {
    try {
      const parsedUrl = new URL(url);

      const queryId =
        parsedUrl.searchParams.get('id');

      if (queryId) {
        return queryId;
      }

      const filePathMatch =
        parsedUrl.pathname.match(
          /\/file\/d\/([^/]+)/
        );

      if (filePathMatch?.[1]) {
        return filePathMatch[1];
      }

      const genericPathMatch =
        parsedUrl.pathname.match(
          /\/d\/([^/]+)/
        );

      return (
        genericPathMatch?.[1] || null
      );
    } catch {
      return null;
    }
  }

  // =========================
  // PREPARAR ACCIONES
  // =========================
  private prepareCurrentActions(): void {
    const current =
      this.currentAnnouncement;

    if (!current) {
      return;
    }

    const alreadySeen =
      current.showMode === 'once_user' &&
      this.isAlreadySeen(current);

    /*
     * Las imágenes no necesitan esperar
     * a que el usuario reproduzca algo.
     */
    if (
      this.isImageMedia ||
      this.isGoogleDriveMedia ||
      this.mediaType === 'none'
    ) {
      this.startDelays(
        current.actions || []
      );

      return;
    }

    /*
     * Si el video ya fue visto, se
     * habilitan las acciones normalmente.
     */
    if (alreadySeen) {
      this.startDelays(
        current.actions || []
      );

      return;
    }

    /*
     * Para videos nuevos, inicialmente
     * se preparan las acciones sin iniciar
     * la cuenta regresiva.
     */
    this.prepareVideoActionState(
      current.actions || []
    );
  }

  private prepareVideoActionState(
    actions: Action[]
  ): void {
    this.delayMap = [];
    this.delaySecondsMap = [];

    actions.forEach(
      (action, index) => {
        if (
          action.delaySeconds &&
          action.delaySeconds > 0
        ) {
          this.delayMap[index] = false;
          this.delaySecondsMap[index] =
            action.delaySeconds;
        } else {
          this.delayMap[index] = true;
        }
      }
    );
  }

  // =========================
  // VIDEO
  // =========================
  playEmbeddedVideo(): void {
    if (this.videoStarted) {
      return;
    }

    this.videoStarted = true;

    const mediaUrl =
      this.currentAnnouncement?.mediaUrl;

    /*
     * YouTube permite reconstruir el
     * iframe con autoplay.
     */
    if (
      mediaUrl &&
      this.isYoutubeMedia
    ) {
      this.safeEmbedUrl =
        this.buildYoutubeUrl(
          mediaUrl,
          true
        );
    }

    /*
     * Drive no expone un evento de play
     * al componente Angular. Al retirar
     * el overlay, el usuario podrá usar
     * los controles internos de Drive.
     */
    this.onVideoPlay();
  }

  onVideoPlay(): void {
    if (this.hasVideoStarted) {
      return;
    }

    this.hasVideoStarted = true;

    this.startDelays(
      this.currentAnnouncement?.actions ||
        []
    );
  }

  onVideoError(): void {
    console.error(
      'No se pudo reproducir el video:',
      this.currentAnnouncement?.mediaUrl
    );
  }

  // =========================
  // FILTRO
  // =========================
  filterAnnouncementsForUser(
    list: Announcement[]
  ): Announcement[] {
    const now = new Date();

    return list.filter(
      (announcement) => {
        if (!announcement.isActive) {
          return false;
        }

        if (
          announcement.startDate &&
          new Date(
            announcement.startDate
          ) > now
        ) {
          return false;
        }

        if (
          announcement.endDate &&
          new Date(
            announcement.endDate
          ) < now
        ) {
          return false;
        }

        if (
          announcement.targetRole &&
          this.user?.role &&
          announcement.targetRole !==
            this.user.role
        ) {
          return false;
        }

        if (
          announcement.targetStudentType &&
          this.user?.classification &&
          announcement.targetStudentType !==
            this.user.classification
        ) {
          return false;
        }

        if (
          announcement.city &&
          this.user?.city
        ) {
          const userCity =
            this.user.city.toLowerCase();

          const targetCity =
            announcement.city.toLowerCase();

          if (userCity !== targetCity) {
            return false;
          }
        }

        if (
          announcement.showMode ===
          'once_user'
        ) {
          const sessionKey =
            `announcement_session_${announcement.id}`;

          if (
            sessionStorage.getItem(
              sessionKey
            )
          ) {
            return false;
          }
        }

        return true;
      }
    );
  }

  // =========================
  // VISTO
  // =========================
  private isAlreadySeen(
    announcement: Announcement | null
  ): boolean {
    if (!announcement) {
      return false;
    }

    return !!localStorage.getItem(
      this.getStorageKey(announcement)
    );
  }

  // =========================
  // NEXT
  // =========================
  next(): void {
    const current =
      this.currentAnnouncement;

    if (current) {
      if (
        current.showMode === 'once_user'
      ) {
        localStorage.setItem(
          this.getStorageKey(current),
          'true'
        );

        sessionStorage.setItem(
          `announcement_session_${current.id}`,
          'true'
        );
      }

      this.closed.emit(current);
    }

    this.currentIndex++;

    if (
      this.currentIndex >=
      this.filtered.length
    ) {
      this.showModal = false;
      this.finished.emit();
      return;
    }

    this.resetCurrentState();
    this.prepareMedia();
    this.prepareCurrentActions();
  }

  private resetCurrentState(): void {
    this.delayMap = [];
    this.delaySecondsMap = [];

    this.videoStarted = false;
    this.hasVideoStarted = false;

    this.mediaType = 'none';
    this.safeEmbedUrl = undefined;
  }

  // =========================
  // ACTIONS
  // =========================
  handleAction(action: Action): void {
    if (action.type === 'close') {
      this.next();
      return;
    }

    if (
      action.type === 'action' &&
      action.url
    ) {
      window.open(
        action.url,
        '_blank',
        'noopener,noreferrer'
      );

      return;
    }

    if (
      action.type === 'whatsapp' &&
      action.url
    ) {
      window.open(
        action.url,
        '_blank',
        'noopener,noreferrer'
      );
    }
  }

  // =========================
  // DELAY
  // =========================
  startDelays(
    actions: Action[]
  ): void {
    this.delayMap = [];
    this.delaySecondsMap = [];

    const current =
      this.currentAnnouncement;

    const alreadySeen =
      current?.showMode === 'once_user' &&
      this.isAlreadySeen(current);

    actions.forEach(
      (action, index) => {
        if (alreadySeen) {
          this.delayMap[index] = true;
          this.delaySecondsMap[index] = 0;
          return;
        }

        if (
          action.delaySeconds &&
          action.delaySeconds > 0
        ) {
          this.delayMap[index] = false;
          this.delaySecondsMap[index] =
            action.delaySeconds;

          const interval = setInterval(
            () => {
              this.delaySecondsMap[index]--;

              if (
                this.delaySecondsMap[
                  index
                ] <= 0
              ) {
                this.delayMap[index] = true;
                clearInterval(interval);
              }
            },
            1000
          );

          return;
        }

        this.delayMap[index] = true;
        this.delaySecondsMap[index] = 0;
      }
    );
  }

  isVideoLocked(): boolean {
    if (!this.hasVideoStarted) {
      return false;
    }

    const actions =
      this.currentAnnouncement?.actions ||
      [];

    return actions.some(
      (action, index) =>
        !!action.delaySeconds &&
        !this.delayMap[index]
    );
  }

  isDisabled(
    action: Action,
    index: number
  ): boolean {
    if (!action.delaySeconds) {
      return false;
    }

    return !this.delayMap[index];
  }

  // =========================
  // CLOSE
  // =========================
  close(): void {
    this.next();
  }

  getButtonColor(
    action: Action
  ): string {
    if (action.type === 'whatsapp') {
      return '#25D366';
    }

    return (
      action.color || '#28336f'
    );
  }
}