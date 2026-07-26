import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-assessment-support',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './assessment-support.component.html',
  styleUrls: ['./assessment-support.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentSupportComponent {

  @Output()
  contactSupport = new EventEmitter<void>();

  onContactSupport(): void {
    this.contactSupport.emit();
  }
}