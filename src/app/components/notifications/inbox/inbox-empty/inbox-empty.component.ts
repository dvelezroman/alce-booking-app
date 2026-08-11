import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-inbox-empty',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './inbox-empty.component.html',
  styleUrl: './inbox-empty.component.scss',
})
export class InboxEmptyComponent {
  @Input() title =
    'Tu bandeja está vacía';

  @Input() description =
    'Cuando recibas avisos, recordatorios o actualizaciones, aparecerán aquí.';

  @Input() illustration:
    'empty-inbox' |
    'no-results' = 'empty-inbox';

  @Input() actionLabel = '';

  @Output() action =
    new EventEmitter<void>();

  get isNoResultsIllustration(): boolean {
    return this.illustration === 'no-results';
  }

  get hasAction(): boolean {
    return this.actionLabel.trim().length > 0;
  }

  onAction(): void {
    this.action.emit();
  }
}