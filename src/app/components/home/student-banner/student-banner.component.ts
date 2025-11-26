import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-banner.component.html',
  styleUrls: ['./student-banner.component.scss']
})
export class StudentBannerComponent {

  @Input() videoUrl: string | null = null;
  @Output() close = new EventEmitter<void>();

  closeBanner() {
    this.close.emit();
  }

  goToVideo() {
    if (this.videoUrl) {
      window.open(this.videoUrl, '_blank');
    }
  }

  goToWhatsapp() {
    window.open('https://wa.link/riz42z', '_blank');
  }
}