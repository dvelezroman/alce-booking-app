import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailySpark } from '../../../../services/dtos/daily-spark.dto';

@Component({
  selector: 'app-student-daily-spark-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-daily-spark-overlay.component.html',
  styleUrl: './student-daily-spark-overlay.component.scss',
})
export class StudentDailySparkOverlayComponent implements OnChanges {
  @Input() spark: DailySpark | null = null;
  @Input() open = false;

  @Output() closed = new EventEmitter<void>();

  revealed = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['spark'] || changes['open']) {
      this.revealed = false;
    }
  }

  get isTrivia(): boolean {
    return this.spark?.kind === 'trivia';
  }

  get label(): string {
    return this.isTrivia ? 'Did you know?' : 'Quote of the day';
  }

  flip(): void {
    if (!this.isTrivia || this.revealed) {
      return;
    }
    this.revealed = true;
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.close();
    }
  }
}
