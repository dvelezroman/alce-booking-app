import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { StageAssessment } from '../../../services/dtos/stage-assessment.dto';

@Component({
  selector: 'app-stage-assessment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stage-assessment-card.component.html',
  styleUrls: ['./stage-assessment-card.component.scss']
})
export class StageAssessmentCardComponent implements OnInit, OnDestroy {

  @Input() assessment!: StageAssessment;
  @Input() highlighted: boolean = false;

  @Output() openAndFinish = new EventEmitter<number>();

  timeFormatted: string = '';
  isUrgent: boolean = false;

  private intervalSub!: Subscription;

  ngOnInit() {
    if (!this.assessment.isPastDue) {
      this.updateCountdown();
      this.intervalSub = interval(1000).subscribe(() => {
        this.updateCountdown();
      });
    }
  }

  ngOnDestroy() {
    this.intervalSub?.unsubscribe();
  }

  private updateCountdown() {

    const now = Date.now();

    const [datePart] = this.assessment.dueDate.split('T');
    const [year, month, day] = datePart.split('-').map(Number);

    const target = new Date(year, month - 1, day, 0, 0, 0).getTime();
    const diff = target - now;

    if (diff <= 0) {
      this.timeFormatted = '00:00:00';
      this.isUrgent = false;
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff / 3600000) % 24);
    const minutes = Math.floor((diff / 60000) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    let formatted = '';
    if (days > 0) formatted += `${days}d `;
    formatted += `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;

    this.timeFormatted = formatted;

    // 🔥 urgente si faltan menos de 24 horas
    this.isUrgent = diff <= 24 * 60 * 60 * 1000;
  }

  private pad(n: number) {
    return n < 10 ? '0' + n : n.toString();
  }

  handleOpenAndFinish() {

    if (this.assessment.isPastDue) return;

    const url = this.assessment?.stageAssessmentResource?.url;

    if (url) window.open(url, '_blank');

    this.openAndFinish.emit(this.assessment.id);
  }
}