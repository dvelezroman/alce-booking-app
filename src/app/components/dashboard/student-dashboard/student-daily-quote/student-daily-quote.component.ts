import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailySparkService } from '../../../../services/daily-spark.service';
import { DailySpark } from '../../../../services/dtos/daily-spark.dto';
import { StudentClassification } from '../../../../services/dtos/student.dto';

@Component({
  selector: 'app-student-daily-quote',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-daily-quote.component.html',
  styleUrl: './student-daily-quote.component.scss',
})
export class StudentDailyQuoteComponent implements OnChanges {
  @Input() userId: number | null = null;
  @Input() classification: StudentClassification | string | null = null;

  spark: DailySpark | null = null;
  revealed = false;

  constructor(private readonly dailySparkService: DailySparkService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId'] || changes['classification']) {
      this.loadSpark();
    }
  }

  get isTrivia(): boolean {
    return this.spark?.kind === 'trivia';
  }

  get title(): string {
    return this.isTrivia ? 'Trivia del día' : 'Frase del día';
  }

  flip(): void {
    if (!this.isTrivia || this.revealed) {
      return;
    }
    this.revealed = true;
  }

  private loadSpark(): void {
    this.revealed = false;

    if (!this.userId) {
      this.spark = null;
      return;
    }

    this.spark = this.dailySparkService.getTodaySpark(
      this.userId,
      this.classification
    );
  }
}
