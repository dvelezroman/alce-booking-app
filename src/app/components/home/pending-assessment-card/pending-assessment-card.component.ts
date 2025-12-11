import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { StageAssessment } from '../../../services/dtos/stage-assessment.dto';

export type StageAssessmentWithCountdown = StageAssessment & {
  timeFormatted?: string;
  isUrgent?: boolean;
};

@Component({
  selector: 'app-pending-assessment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-assessment-card.component.html',
  styleUrl: './pending-assessment-card.component.scss'
})
export class PendingAssessmentCardComponent implements OnInit, OnDestroy {

  @Input() assessments: StageAssessmentWithCountdown[] = [];

  private intervalSub!: Subscription;
  
  iconUrl = 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png';
  fallbackIcon = 'assets/test.png';

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateCountdowns();

    this.intervalSub = interval(1000).subscribe(() => {
      this.updateCountdowns();
    });
  }

  ngOnDestroy() {
    this.intervalSub?.unsubscribe();
  }

  updateCountdowns() {
    const now = Date.now();

    this.assessments = this.assessments.map(a => {

      const [datePart] = a.dueDate.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const target = new Date(year, month - 1, day, 0, 0, 0).getTime();

      const diff = target - now;

      if (diff <= 0) {
        return {
          ...a,
          timeFormatted: '00:00:00',
          isUrgent: false
        };
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff / 3600000) % 24);
      const minutes = Math.floor((diff / 60000) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      let formatted = '';
      if (days > 0) formatted += `${days}d `;
      formatted += `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;

      return {
        ...a,
        timeFormatted: formatted,
        isUrgent: diff <= 24 * 60 * 60 * 1000
      };
    });
  }

  pad(n: number) {
    return n < 10 ? '0' + n : n.toString();
  }

  goToAssessmentPage(id: number) {
    this.router.navigate(['/dashboard/stage-assessment-student']);
  }
}