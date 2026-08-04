import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';

import { UserRole } from '../../../services/dtos/user.dto';
import { StudentClassification } from '../../../services/dtos/student.dto';
import { Action } from '../../../services/dtos/announcement.dto';

@Component({
  selector: 'app-preview-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-card.component.html',
  styleUrl: './preview-card.component.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class PreviewCardComponent
  implements OnChanges
{
  @Input() title!: string;
  @Input() type!: string;
  @Input() media?: string;

  @Input() role: UserRole | null = null;

  @Input()
  studentClassification:
    | StudentClassification
    | null = null;

  @Input()
  city: 'Portoviejo' | 'Cuenca' | null =
    null;

  @Input() isActive!: boolean;
  @Input() actions: Action[] = [];

  @Input()
  aspectRatio:
    | 'horizontal'
    | 'vertical'
    | 'square' = 'horizontal';

  safeEmbedUrl?: SafeResourceUrl;

  isYoutubeMedia = false;
  isGoogleDriveMedia = false;

  constructor(
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges(
    changes: SimpleChanges
  ): void {
    if (!changes['media']) {
      return;
    }

    this.resetMediaState();

    const mediaUrl = this.media?.trim();

    if (!mediaUrl) {
      return;
    }

    this.isYoutubeMedia =
      this.isYoutubeUrl(mediaUrl);

    this.isGoogleDriveMedia =
      this.isGoogleDriveUrl(mediaUrl);

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

  // =========================
  // BOTONES
  // =========================
  get actionButtons(): Action[] {
    return (
      this.actions?.filter(
        (action) =>
          action.type === 'action' ||
          action.type === 'whatsapp'
      ) || []
    );
  }

  hasClose(): boolean {
    return (
      this.actions?.some(
        (action) =>
          action.type === 'close'
      ) || false
    );
  }

  // =========================
  // TIPO DE ARCHIVO
  // =========================
  isVideoFile(): boolean {
    const mediaUrl = this.media?.trim();

    if (!mediaUrl) {
      return false;
    }

    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(
      mediaUrl
    );
  }

  // =========================
  // YOUTUBE
  // =========================
  private isYoutubeUrl(
    url: string
  ): boolean {
    try {
      const parsedUrl = new URL(url);
      const hostname =
        parsedUrl.hostname.toLowerCase();

      return (
        hostname === 'youtu.be' ||
        hostname === 'www.youtu.be' ||
        hostname === 'youtube.com' ||
        hostname === 'www.youtube.com' ||
        hostname ===
          'm.youtube.com'
      );
    } catch {
      return false;
    }
  }

  private buildYoutubeUrl(
    url: string
  ): SafeResourceUrl | undefined {
    const videoId =
      this.extractYoutubeVideoId(url);

    if (!videoId) {
      return undefined;
    }

    const embedUrl =
      `https://www.youtube.com/embed/${videoId}?rel=0`;

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

  // =========================
  // GOOGLE DRIVE
  // =========================
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

      const idFromQuery =
        parsedUrl.searchParams.get('id');

      if (idFromQuery) {
        return idFromQuery;
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

      return genericPathMatch?.[1] || null;
    } catch {
      return null;
    }
  }

  // =========================
  // ESTADO MEDIA
  // =========================
  private resetMediaState(): void {
    this.safeEmbedUrl = undefined;
    this.isYoutubeMedia = false;
    this.isGoogleDriveMedia = false;
  }

  // =========================
  // ESTILO DE BOTONES
  // =========================
  getButtonStyle(action: Action): {
    background: string;
    color: string;
    border: string;
  } {
    const background =
      action.color ||
      (action.type === 'whatsapp'
        ? '#25D366'
        : '#28336f');

    return {
      background,
      color: '#ffffff',
      border: 'none',
    };
  }
}