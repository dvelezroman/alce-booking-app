import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assessment-announcement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-announcement.component.html',
  styleUrls: ['./assessment-announcement.component.scss'],
})
export class AssessmentAnnouncementComponent {
  
  @Input() show = false;
  @Input() count: number = 0;

  @Output() closed = new EventEmitter<void>();

  constructor(private router: Router) {}

  close() {
    localStorage.setItem('assessment_announced', 'true');
    this.closed.emit();
  }

  goToHelp() {
    this.router.navigate(['/dashboard/stage-assessment-help']);
  }
}