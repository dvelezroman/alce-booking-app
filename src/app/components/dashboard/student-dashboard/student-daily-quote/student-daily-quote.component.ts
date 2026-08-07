import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';

type DailyQuote = {
  text: string;
  author: string;
};

@Component({
  selector: 'app-student-daily-quote',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-daily-quote.component.html',
  styleUrl: './student-daily-quote.component.scss',
})
export class StudentDailyQuoteComponent
  implements OnInit, OnDestroy
{
  quotes: DailyQuote[] = [
    {
      text: 'The limits of my language mean the limits of my world.',
      author: 'Ludwig Wittgenstein',
    },
    {
      text: 'A different language is a different vision of life.',
      author: 'Federico Fellini',
    },
    {
      text: 'Language is the road map of a culture.',
      author: 'Rita Mae Brown',
    },
    {
      text: 'To have another language is to possess a second soul.',
      author: 'Charlemagne',
    },
    {
      text: 'Learning another language is like becoming another person.',
      author: 'Haruki Murakami',
    },
  ];

  currentQuoteIndex = 0;

  private quoteInterval?: Subscription;

  get currentQuote(): DailyQuote {
    return this.quotes[this.currentQuoteIndex];
  }

  ngOnInit(): void {
    this.selectDailyQuote();

    this.quoteInterval = interval(
      15000
    ).subscribe(() => {
      this.showNextQuote();
    });
  }

  ngOnDestroy(): void {
    this.quoteInterval?.unsubscribe();
  }

  showNextQuote(): void {
    if (this.quotes.length <= 1) {
      return;
    }

    this.currentQuoteIndex =
      (this.currentQuoteIndex + 1) %
      this.quotes.length;
  }

  showPreviousQuote(): void {
    if (this.quotes.length <= 1) {
      return;
    }

    this.currentQuoteIndex =
      (
        this.currentQuoteIndex -
        1 +
        this.quotes.length
      ) % this.quotes.length;
  }

  selectQuote(index: number): void {
    if (
      index < 0 ||
      index >= this.quotes.length
    ) {
      return;
    }

    this.currentQuoteIndex = index;
  }

  private selectDailyQuote(): void {
    if (this.quotes.length === 0) {
      return;
    }

    const today = new Date();

    const startOfYear = new Date(
      today.getFullYear(),
      0,
      0
    );

    const difference =
      today.getTime() -
      startOfYear.getTime();

    const dayOfYear = Math.floor(
      difference / 86400000
    );

    this.currentQuoteIndex =
      dayOfYear % this.quotes.length;
  }
}