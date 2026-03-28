import { Component, Input } from '@angular/core';
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
})
export class PreviewCardComponent {

  @Input() title!: string;
  @Input() type!: string;
  @Input() media?: string;

  @Input() role: UserRole | null = null;
  @Input() studentClassification: StudentClassification | null = null;
  @Input() city: 'Portoviejo' | 'Cuenca' | null = null;

  @Input() isActive!: boolean;
  @Input() actions: Action[] = [];

  constructor(private sanitizer: DomSanitizer) {}

  // =========================
  // 🔥 BOTONES (FIX IMPORTANTE)
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
  // LABELS
  // =========================
  getActionLabel(action: Action): string {
    if (action.label) return action.label;

    const labels: Record<ActionType, string> = {
      action: 'Acción',
      whatsapp: 'WhatsApp',
      close: 'Cerrar',
    };

    return labels[action.type];
  }

  // =========================
  // TYPE
  // =========================
  getTypeLabel(): string {
    if (!this.type) return '';

    const map: Record<string, string> = {
      promotion: 'Promoción',
      notice: 'Aviso',
      relocation: 'Re-ubicación',
    };

    return map[this.type] || '';
  }

  // =========================
  // ROLE
  // =========================
  getRoleLabel(): string {
    const map: Record<string, string> = {
      STUDENT: 'Estudiante',
      INSTRUCTOR: 'Instructor',
      ADMIN: 'Administrador',
    };

    return map[this.role ?? ''] || '';
  }

  // =========================
  // YOUTUBE
  // =========================
  isYoutube(): boolean {
    if (!this.media) return false;
    return this.media.includes('youtube.com') || this.media.includes('youtu.be');
  }

  getYoutubeEmbedUrl(): SafeResourceUrl {
    if (!this.media) return '';

    let videoId = '';

    try {
      const url = new URL(this.media);

      if (url.hostname.includes('youtube.com')) {
        videoId = url.searchParams.get('v') || '';
      }

      if (url.hostname.includes('youtu.be')) {
        videoId = url.pathname.replace('/', '');
      }

    } catch (e) {
      console.error('URL inválida', e);
    }

    if (!videoId) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  // =========================
  // VIDEO FILE
  // =========================
  isVideoFile(): boolean {
    if (!this.media) return false;
    return this.media.match(/\.(mp4|webm|ogg)$/i) !== null;
  }

  getButtonStyle(action: Action) {
    const bg = action.color || (action.type === 'whatsapp' ? '#25D366' : '#28336f');

    return {
      'background': bg,
      'color': '#ffffff',
      'border': 'none'
    };
  }
}