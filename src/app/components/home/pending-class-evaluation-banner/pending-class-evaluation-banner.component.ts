import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pending-class-evaluation-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-class-evaluation-banner.component.html',
  styleUrl: './pending-class-evaluation-banner.component.scss'
})
export class PendingClassEvaluationBannerComponent {

  @Input() count = 0;

  @Output() goToEvaluate = new EventEmitter<void>();

  onClick(): void {
    this.goToEvaluate.emit();
  }
}