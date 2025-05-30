import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assessment-min-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-min-config.component.html',
  styleUrl: './assessment-min-config.component.scss'
})
export class AssessmentMinConfigComponent {
  @Input() minPoints: number | null = null;
  @Output() minPointsChanged = new EventEmitter<number>();

  showConfigForm = false;

  save(): void {
    if (this.minPoints !== null) {
      this.minPointsChanged.emit(this.minPoints);
    }
  }
}