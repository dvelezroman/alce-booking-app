import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  Announcement,
} from '../../../services/dtos/announcement.dto';


type AnnouncementFilter =
  | 'all'
  | 'active'
  | 'inactive';

type AnnouncementMediaType =
  | 'image'
  | 'video'
  | 'youtube'
  | 'google-drive'
  | 'none';


@Component({
  selector: 'app-announcement-v2-list',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './announcement-v2-list.component.html',
  styleUrl: './announcement-v2-list.component.scss',
})
export class AnnouncementV2ListComponent {

  /* =========================================================
     INPUTS
  ========================================================= */

  @Input() announcements: Announcement[] = [];
  @Input() filterTab: AnnouncementFilter = 'all';


  /* =========================================================
     OUTPUTS
  ========================================================= */

  @Output() filterChange = new EventEmitter<AnnouncementFilter>();
  @Output() toggle = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Announcement>();
  @Output() delete = new EventEmitter<string>();


  /* =========================================================
     FILTERED
  ========================================================= */

  get filteredAnnouncements(): Announcement[] {
    if (this.filterTab === 'active') {
      return this.announcements.filter(
        announcement => announcement.isActive,
      );
    }

    if (this.filterTab === 'inactive') {
      return this.announcements.filter(
        announcement => !announcement.isActive,
      );
    }

    return this.announcements;
  }


  /* =========================================================
     COUNTERS
  ========================================================= */

  get allCount(): number {
    return this.announcements.length;
  }

  get activeCount(): number {
    return this.announcements.filter(
      announcement => announcement.isActive,
    ).length;
  }

  get inactiveCount(): number {
    return this.announcements.filter(
      announcement => !announcement.isActive,
    ).length;
  }


  /* =========================================================
     FILTER
  ========================================================= */

  setFilter(
    value: AnnouncementFilter,
  ): void {
    this.filterChange.emit(value);
  }


  /* =========================================================
     ACTIONS
  ========================================================= */

  onToggle(
    id: string,
  ): void {
    this.toggle.emit(id);
  }

  onEdit(
    announcement: Announcement,
  ): void {
    this.edit.emit(announcement);
  }

  onDelete(
    id: string,
  ): void {
    this.delete.emit(id);
  }


  /* =========================================================
     LABELS
  ========================================================= */

  getTypeLabel(
    type: string,
  ): string {
    switch (type) {
      case 'promotion':
        return 'Promoción';

      case 'notice':
        return 'Aviso';

      case 'relocation':
        return 'Reubicación';

      default:
        return 'Anuncio';
    }
  }

  getRoleLabel(
    role: unknown,
  ): string {
    if (!role) {
      return 'Todos';
    }

    switch (String(role)) {
      case 'STUDENT':
        return 'Estudiantes';

      case 'INSTRUCTOR':
        return 'Instructores';

      case 'ADMIN':
        return 'Administradores';

      default:
        return String(role);
    }
  }

  getAudienceLabel(
    announcement: Announcement,
  ): string {
    const parts: string[] = [];

    parts.push(
      this.getRoleLabel(
        announcement.targetRole,
      ),
    );

    if (announcement.targetStudentType) {
      parts.push(
        String(
          announcement.targetStudentType,
        ),
      );
    }

    if (announcement.city) {
      parts.push(
        announcement.city,
      );
    }

    return parts.join(' · ');
  }


  /* =========================================================
     DATE
  ========================================================= */

  formatDate(
    value?: string | null,
  ): string {
    if (!value) {
      return 'Sin fecha';
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return value;
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    ).format(date);
  }

  getValidityLabel(
    announcement: Announcement,
  ): string {
    if (
      announcement.startDate &&
      announcement.endDate
    ) {
      return (
        `${this.formatDate(announcement.startDate)} - ` +
        `${this.formatDate(announcement.endDate)}`
      );
    }

    if (announcement.startDate) {
      return `Desde ${this.formatDate(announcement.startDate)}`;
    }

    if (announcement.endDate) {
      return `Hasta ${this.formatDate(announcement.endDate)}`;
    }

    return 'Sin vigencia definida';
  }


  /* =========================================================
     MEDIA
  ========================================================= */

  getMediaUrl(
    announcement: Announcement,
  ): string {
    return announcement.mediaUrl || '';
  }

  getMediaType(
    value?: string,
  ): AnnouncementMediaType {
    const url = value?.trim();

    if (!url) {
      return 'none';
    }

    if (this.isYoutubeUrl(url)) {
      return 'youtube';
    }

    if (this.isGoogleDriveUrl(url)) {
      return 'google-drive';
    }

    if (this.isVideo(url)) {
      return 'video';
    }

    return 'image';
  }

  isImageMedia(
    value?: string,
  ): boolean {
    return this.getMediaType(value) === 'image';
  }

  isVideoMedia(
    value?: string,
  ): boolean {
    return this.getMediaType(value) === 'video';
  }

  isYoutubeMedia(
    value?: string,
  ): boolean {
    return this.getMediaType(value) === 'youtube';
  }

  isGoogleDriveMedia(
    value?: string,
  ): boolean {
    return this.getMediaType(value) === 'google-drive';
  }

  isVideo(
    value?: string,
  ): boolean {
    if (!value) {
      return false;
    }

    return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(
      value,
    );
  }


  /* =========================================================
     YOUTUBE
  ========================================================= */

  private isYoutubeUrl(
    url: string,
  ): boolean {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();

      return (
        hostname === 'youtu.be' ||
        hostname === 'www.youtu.be' ||
        hostname === 'youtube.com' ||
        hostname === 'www.youtube.com' ||
        hostname === 'm.youtube.com'
      );
    } catch {
      return false;
    }
  }

  getYoutubeThumbnail(
    url: string,
  ): string {
    const videoId =
      this.extractYoutubeVideoId(
        url,
      );

    if (!videoId) {
      return '';
    }

    return (
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    );
  }

  private extractYoutubeVideoId(
    url: string,
  ): string | null {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();

      if (
        hostname === 'youtu.be' ||
        hostname === 'www.youtu.be'
      ) {
        return (
          parsedUrl.pathname
            .split('/')
            .filter(Boolean)[0] ||
          null
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
        return pathParts[embedIndex + 1];
      }

      const shortsIndex =
        pathParts.indexOf('shorts');

      if (
        shortsIndex >= 0 &&
        pathParts[shortsIndex + 1]
      ) {
        return pathParts[shortsIndex + 1];
      }

      return null;
    } catch {
      return null;
    }
  }


  /* =========================================================
    GOOGLE DRIVE
  ========================================================= */

  private isGoogleDriveUrl(
    url: string,
  ): boolean {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();

      return (
        hostname === 'drive.google.com' ||
        hostname.endsWith('.drive.google.com')
      );
    } catch {
      return false;
    }
  }


  /* =========================================================
    IMAGE STATE
  ========================================================= */

  loadedImages = new Set<string>();
  imageErrors = new Set<string>();

  onImageLoad(id: string): void {
    this.loadedImages.add(id);
    this.imageErrors.delete(id);
  }

  onImageError(id: string): void {
    this.loadedImages.delete(id);
    this.imageErrors.add(id);
  }

  isImageLoading(id: string): boolean {
    return (
      !this.loadedImages.has(id) &&
      !this.imageErrors.has(id)
    );
  }

  hasImageError(id: string): boolean {
    return this.imageErrors.has(id);
  }


  /* =========================================================
     TRACK
  ========================================================= */

  trackByAnnouncementId(
    index: number,
    announcement: Announcement,
  ): string {
    return announcement.id;
  }

  getGoogleDriveThumbnail(
    url: string,
  ): string | null {

    const fileId =
      this.extractGoogleDriveFileId(
        url,
      );

    if (!fileId) {
      return null;
    }

    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }

  private extractGoogleDriveFileId(
    url: string,
  ): string | null {
    try {
      const parsedUrl = new URL(url);

      const idFromQuery =
        parsedUrl.searchParams.get('id');

      if (idFromQuery) {
        return idFromQuery;
      }

      const filePathMatch =
        parsedUrl.pathname.match(
          /\/file\/d\/([^/]+)/,
        );

      if (filePathMatch?.[1]) {
        return filePathMatch[1];
      }

      const genericPathMatch =
        parsedUrl.pathname.match(
          /\/d\/([^/]+)/,
        );

      return genericPathMatch?.[1] || null;
    } catch {
      return null;
    }
  }
  
}