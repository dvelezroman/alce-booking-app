import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export type AssessmentAnnouncementVariant = 'pending' | 'retake';

@Component({
  selector: 'app-assessment-announcement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-announcement.component.html',
  styleUrls: ['./assessment-announcement.component.scss'],
})
export class AssessmentAnnouncementComponent {
  @Input() show = false;
  @Input() count = 0;
  @Input() evaluationsRoute = '/dashboard/stage-assessment-student';
  @Input() variant: AssessmentAnnouncementVariant = 'pending';
  @Input() retakeTemplateTitle = '';

  @Output() closed = new EventEmitter<void>();

  constructor(private router: Router) {}

  get isRetake(): boolean {
    return this.variant === 'retake';
  }

  close() {
    if (!this.isRetake) {
      localStorage.setItem('assessment_announced', 'true');
    }
    this.router.navigate([this.evaluationsRoute]);
    this.closed.emit();
  }

  closeOnly() {
    if (!this.isRetake) {
      localStorage.setItem('assessment_announced', 'true');
    }
    this.closed.emit();
  }

  goToHelp() {
    window.open(
      'https://youtube.com/shorts/Hp2a3fii9MU?feature=share',
      '_blank',
    );
  }
}
