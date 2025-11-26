import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-banner.component.html',
  styleUrls: ['./student-banner.component.scss']
})
export class StudentBannerComponent {

  @Output() close = new EventEmitter<void>();

  closeBanner() {
    this.close.emit();
  }

  goToVideo() {
    window.open('https://www.youtube.com/', '_blank');
  }

  goToWhatsapp() {
    window.open('https://wa.link/riz42z', '_blank');
  }
}