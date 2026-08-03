import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';

import { Announcement } from '../../../services/dtos/announcement.dto';

@Component({
  selector: 'app-announcement-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './announcement-card.component.html',
  styleUrl: './announcement-card.component.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class AnnouncementCardComponent
  implements OnChanges
{
  @Input() announcement!: Announcement;

  @Output() edit =
    new EventEmitter<void>();

  @Output() toggle =
    new EventEmitter<void>();

  @Output() delete =
    new EventEmitter<void>();

  safeEmbedUrl?: SafeResourceUrl;

  isYoutubeMedia = false;
  isGoogleDriveMedia = false;

  driveThumbnailUrl?: string;

  constructor(
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges(
    changes: SimpleChanges
  ): void {
    if (!changes['announcement']) {
      return;
    }

    this.resetMediaState();

    const mediaUrl =
      this.announcement?.mediaUrl?.trim();

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
      const fileId =
        this.extractGoogleDriveFileId(mediaUrl);

      if (!fileId) {
        return;
      }

      this.safeEmbedUrl =
        this.buildGoogleDriveUrl(mediaUrl);

      this.driveThumbnailUrl =
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
  }

  onToggle(): void {
    this.toggle.emit();
  }

  onEdit(): void {
    this.edit.emit();
  }

  onDelete(): void {
    this.delete.emit();
  }

  isVideoFile(): boolean {
    const mediaUrl =
      this.announcement?.mediaUrl?.trim();

    if (!mediaUrl) {
      return false;
    }

    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(
      mediaUrl
    );
  }

  openGoogleDriveVideo(): void {
    const mediaUrl =
      this.announcement?.mediaUrl?.trim();

    if (!mediaUrl) {
      return;
    }

    const fileId =
      this.extractGoogleDriveFileId(mediaUrl);

    if (!fileId) {
      return;
    }

    const previewUrl =
      `https://drive.google.com/file/d/${fileId}/preview`;

    window.open(
      previewUrl,
      '_blank',
      'noopener,noreferrer'
    );
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

  private resetMediaState(): void {
    this.safeEmbedUrl = undefined;
    this.driveThumbnailUrl = undefined;

    this.isYoutubeMedia = false;
    this.isGoogleDriveMedia = false;
  }
}