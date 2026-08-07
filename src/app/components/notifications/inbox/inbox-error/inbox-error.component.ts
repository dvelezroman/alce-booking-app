import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-inbox-error',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './inbox-error.component.html',
  styleUrl: './inbox-error.component.scss',
})
export class InboxErrorComponent {
  @Input() message =
    'No pudimos cargar tus notificaciones.';

  @Output() retry =
    new EventEmitter<void>();

  onRetry(): void {
    this.retry.emit();
  }
}