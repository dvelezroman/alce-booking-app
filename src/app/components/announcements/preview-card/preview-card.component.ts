import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { UserRole } from '../../../services/dtos/user.dto';
import { StudentClassification } from '../../../services/dtos/student.dto';
import { Action } from '../../../services/dtos/announcement.dto';

type ActionType = Action['type'];

@Component({
  selector: 'app-preview-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-card.component.html',
  styleUrl: './preview-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewCardComponent implements OnChanges {

  @Input() title!: string;
  @Input() type!: string;
  @Input() media?: string;

  @Input() role: UserRole | null = null;
  @Input() studentClassification: StudentClassification | null = null;
  @Input() city: 'Portoviejo' | 'Cuenca' | null = null;

  @Input() isActive!: boolean;
  @Input() actions: Action[] = [];

  safeYoutubeUrl?: SafeResourceUrl;
  isYoutubeMedia = false;

  constructor(private sanitizer: DomSanitizer) {}

  // 🔥 SOLO CUANDO CAMBIA MEDIA
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['media'] && this.media) {

      this.isYoutubeMedia =
        this.media.includes('youtube.com') ||
        this.media.includes('youtu.be');

      if (this.isYoutubeMedia) {
        this.safeYoutubeUrl = this.buildYoutubeUrl(this.media);
      } else {
        this.safeYoutubeUrl = undefined;
      }
    }
  }

  // =========================
  // 🔥 BOTONES
  // =========================
  get actionButtons(): Action[] {
    return this.actions?.filter(a =>
      a.type === 'action' || a.type === 'whatsapp'
    ) || [];
  }

  hasClose(): boolean {
    return this.actions?.some(a => a.type === 'close');
  }

  // =========================
  // VIDEO FILE
  // =========================
  isVideoFile(): boolean {
    if (!this.media) return false;
    return this.media.match(/\.(mp4|webm|ogg)$/i) !== null;
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
  // BUTTON STYLE
  // =========================
  getButtonStyle(action: Action) {
    const bg = action.color || (action.type === 'whatsapp' ? '#25D366' : '#28336f');

    return {
      background: bg,
      color: '#ffffff',
      border: 'none'
    };
  }
}