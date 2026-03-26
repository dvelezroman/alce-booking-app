import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnouncementCardComponent } from '../announcement-card/announcement-card.component';
import { Announcement } from '../../../services/dtos/announcement.dto';

@Component({
  selector: 'app-announcements-list',
  standalone: true,
  imports: [CommonModule, AnnouncementCardComponent],
  templateUrl: './announcements-list.component.html',
  styleUrl: './announcements-list.component.scss'
})
export class AnnouncementsListComponent {

  @Input() announcements: Announcement[] = [];
  @Input() filterTab: 'all' | 'active' | 'inactive' = 'all';

  @Output() filterChange = new EventEmitter<'all' | 'active' | 'inactive'>();
  @Output() toggle = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  get filteredAnnouncements(): Announcement[] {
    if (this.filterTab === 'active') {
      return this.announcements.filter(a => a.isActive);
    }

    if (this.filterTab === 'inactive') {
      return this.announcements.filter(a => !a.isActive);
    }

    return this.announcements;
  }

  setFilter(value: 'all' | 'active' | 'inactive') {
    this.filterChange.emit(value);
  }

  onToggle(id: string) {
    this.toggle.emit(id);
  }

  onDelete(id: string) {
    this.delete.emit(id);
  }
}