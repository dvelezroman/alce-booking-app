import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assessment-hours-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-hours-config.component.html',
  styleUrl: './assessment-hours-config.component.scss'
})
export class AssessmentHoursConfigComponent {
  @Input() minHoursScheduled: number | null = null;
  @Output() minHoursChanged = new EventEmitter<number>();

  showConfigForm: boolean = false;

  save(): void {
    if (this.minHoursScheduled !== null) {
      this.minHoursChanged.emit(this.minHoursScheduled);
    }
  }
}