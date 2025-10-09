import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unread-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unread-banner.component.html',
  styleUrls: ['./unread-banner.component.scss']
})
export class UnreadBannerComponent implements OnChanges {

  @Input() count: number = 0;
  @Input() showDurationMs = 10_000;

  visible = false;
  private hideTimer?: any;

  constructor(private router: Router) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['count']) {
      this.resetTimer();
    }
  }

  private resetTimer() {
    if (this.count > 0) {
      this.visible = true;
      clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(() => (this.visible = false), this.showDurationMs);
    } else {
      this.visible = false;
    }
  }

  close() {
    this.visible = false;
    clearTimeout(this.hideTimer);
  }

   goToNotifications() {
    this.visible = false;
    clearTimeout(this.hideTimer);
    this.router.navigate(['/dashboard/notifications-inbox']);
  }
}