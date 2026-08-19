import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-suspension-history-header',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './suspension-history-header.component.html',
  styleUrl: './suspension-history-header.component.scss',
})
export class SuspensionHistoryHeaderComponent {

  @Output()
  exportRequested =
    new EventEmitter<void>();

  @Output()
  refreshRequested =
    new EventEmitter<void>();


  onExport(): void {
    this.exportRequested.emit();
  }


  onRefresh(): void {
    this.refreshRequested.emit();
  }
}