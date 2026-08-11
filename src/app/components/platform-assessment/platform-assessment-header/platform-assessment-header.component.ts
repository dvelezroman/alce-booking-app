import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-platform-assessment-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl:
    './platform-assessment-header.component.html',
  styleUrl:
    './platform-assessment-header.component.scss',
})
export class PlatformAssessmentHeaderComponent {
  @Input() loading = false;

  @Output() refresh =
    new EventEmitter<void>();

  onRefresh(): void {
    if (this.loading) {
      return;
    }

    this.refresh.emit();
  }
}