import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-instructor-scheduling-request-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instructor-scheduling-request-header.component.html',
  styleUrl: './instructor-scheduling-request-header.component.scss',
})
export class InstructorSchedulingRequestHeaderComponent {
  @Input() loading: boolean = false;
  @Input() title = 'Solicitudes de agendamiento';
  @Input() description =
    'Gestiona solicitudes de clases demo y exámenes de ubicación.';

  @Output() refreshRequested = new EventEmitter<void>();

  onRefresh(): void {
    if (this.loading) return;

    this.refreshRequested.emit();
  }
}