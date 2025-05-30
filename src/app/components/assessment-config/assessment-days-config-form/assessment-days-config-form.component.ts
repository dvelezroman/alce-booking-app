import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assessment-days-config-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-days-config-form.component.html',
  styleUrl: './assessment-days-config-form.component.scss'
})
export class AssessmentDaysConfigFormComponent {
  @Input() daysAsNewStudent: number | null = null;
  @Output() daysChanged = new EventEmitter<number>();

  showConfigForm: boolean = false;

  save(): void {
    if (this.daysAsNewStudent !== null) {
      this.daysChanged.emit(this.daysAsNewStudent);
    }
  }
}