import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assessment-config-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-config-form.component.html',
  styleUrl: './assessment-config-form.component.scss'
})
export class AssessmentConfigFormComponent {
  @Input() maxPoints: number | null = null;
  @Output() maxPointsChanged = new EventEmitter<number>();

  showConfigForm: boolean = false;

  save(): void {
    if (this.maxPoints !== null) {
      this.maxPointsChanged.emit(this.maxPoints);
    }
  }
}