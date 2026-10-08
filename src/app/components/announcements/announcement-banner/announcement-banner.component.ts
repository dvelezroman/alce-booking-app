import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { Announcement } from '../../../services/dtos/announcement.dto';
import {
  AnnouncementViewerUser,
  dismissBannerAnnouncement,
  getBannerDisplayText,
  getVisibleBannerAnnouncements,
} from '../../../shared/utils/announcement-display.util';

@Component({
  selector: 'app-announcement-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './announcement-banner.component.html',
  styleUrl: './announcement-banner.component.scss',
})
export class AnnouncementBannerComponent implements OnChanges {
  @Input() announcements: Announcement[] = [];
  @Input() user!: AnnouncementViewerUser;

  @Output() dismissed = new EventEmitter<Announcement>();

  visible: Announcement[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['announcements'] || changes['user']) {
      this.refreshVisible();
    }
  }

  refreshVisible(): void {
    if (!this.user) {
      this.visible = [];
      return;
    }

    this.visible = getVisibleBannerAnnouncements(
      this.announcements,
      this.user,
    );
  }

  displayText(announcement: Announcement): string {
    return getBannerDisplayText(announcement);
  }

  toneClass(announcement: Announcement): string {
    const tone = announcement.bannerTone ?? 'accent';
    return `announcement-banner__item--${tone}`;
  }

  dismiss(announcement: Announcement): void {
    dismissBannerAnnouncement(announcement, this.user);
    this.dismissed.emit(announcement);
    this.refreshVisible();
  }

  trackById(_index: number, item: Announcement): string {
    return item.id;
  }
}
