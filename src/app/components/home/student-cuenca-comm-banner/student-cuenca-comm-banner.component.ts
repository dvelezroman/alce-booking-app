import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-cuenca-comm-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-cuenca-comm-banner.component.html',
  styleUrls: ['./student-cuenca-comm-banner.component.scss'],
})
export class StudentCuencaCommBannerComponent {
  
  @Input() show: boolean = true;

  closeBanner() {
    this.show = false;
  }

  goToInfo() {
    window.open('https://wa.link/riz42z', '_blank');
  }
}