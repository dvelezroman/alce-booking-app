import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-statistics-header',
  standalone: true,
  imports: [],
  templateUrl: './statistics-header.component.html',
  styleUrl: './statistics-header.component.scss',
})
export class StatisticsHeaderComponent {

  @Output() exportRequested =
    new EventEmitter<void>();

  onExport(): void {
    this.exportRequested.emit();
  }
}