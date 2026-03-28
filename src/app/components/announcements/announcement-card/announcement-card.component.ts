import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Announcement } from '../../../services/dtos/announcement.dto';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-announcement-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './announcement-card.component.html',
  styleUrl: './announcement-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnouncementCardComponent implements OnChanges {

  @Input() announcement!: Announcement;

  @Output() toggle = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  safeYoutubeUrl?: SafeResourceUrl;
  isYoutubeMedia = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['announcement'] && this.announcement?.mediaUrl) {

      const url = this.announcement.mediaUrl;

      this.isYoutubeMedia =
        url.includes('youtube.com') ||
        url.includes('youtu.be');

      if (this.isYoutubeMedia) {
        this.safeYoutubeUrl = this.buildYoutubeUrl(url);
      } else {
        this.safeYoutubeUrl = undefined;
      }
    }
  }

  onToggle() {
    this.toggle.emit();
  }

  onDelete() {
    this.delete.emit();
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
}