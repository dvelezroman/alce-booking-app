import {
  Component,
  Input,
  OnChanges,
  OnInit,
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
export class StudentDailyQuoteComponent implements OnInit, OnChanges {
  @Input() userId: number | null = null;
  @Input() classification: StudentClassification | string | null = null;

  quoteSpark: DailySpark | null = null;
  triviaSpark: DailySpark | null = null;
  triviaRevealed = false;

  constructor(private readonly dailySparkService: DailySparkService) {}

  ngOnInit(): void {
    this.loadSparks();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId'] || changes['classification']) {
      this.loadSparks();
    }
  }

  flipTrivia(): void {
    if (this.triviaRevealed) {
      return;
    }
    this.triviaRevealed = true;
  }

  private loadSparks(): void {
    this.triviaRevealed = false;

    if (!this.userId) {
      this.quoteSpark = null;
      this.triviaSpark = null;
      return;
    }

    this.quoteSpark = this.dailySparkService.getTodayQuote(
      this.userId,
      this.classification
    );
    this.triviaSpark = this.dailySparkService.getTodayTrivia(
      this.userId,
      this.classification
    );
  }
}
