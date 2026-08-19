import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

@Component({
  selector: 'app-suspension-history-quick-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suspension-history-quick-actions.component.html',
  styleUrl: './suspension-history-quick-actions.component.scss'
})
export class SuspensionHistoryQuickActionsComponent {

  @Output() exportRequested =
    new EventEmitter<void>();

  @Output() refreshRequested =
    new EventEmitter<void>();

  @Output() clearFiltersRequested =
    new EventEmitter<void>();

  onExport(): void {
    this.exportRequested.emit();
  }

  onRefresh(): void {
    this.refreshRequested.emit();
  }

  onClearFilters(): void {
    this.clearFiltersRequested.emit();
  }
}