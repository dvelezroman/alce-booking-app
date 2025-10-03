import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { GetEmailMessagesQuery } from '../../../services/dtos/email.dto';

@Component({
  selector: 'app-email-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-filters.component.html',
  styleUrl: './email-filters.component.scss',
})
export class EmailFiltersComponent implements OnInit {
  @Input() filters: Partial<GetEmailMessagesQuery> = {};
  @Output() filtersChange = new EventEmitter<Partial<GetEmailMessagesQuery>>();

  private emailSearch$ = new Subject<string>();

  ngOnInit(): void {
    this.emailSearch$.pipe(debounceTime(800)).subscribe((term) => {
      this.filters = { ...this.filters, recipientEmail: term };
      this.filtersChange.emit(this.filters);
    });
  }

  onFilterChange(key: keyof GetEmailMessagesQuery, value: string | number) {
    this.filters = { ...this.filters, [key]: value };
    this.filtersChange.emit(this.filters);
  }

  // onLimitChange(value: string) {
  //   const parsed = parseInt(value, 10);
  //   this.onFilterChange('limit', parsed);
  // }

  onDateChange(key: keyof GetEmailMessagesQuery, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value ? input.value : '';
    this.filters = { ...this.filters, [key]: value };
    this.filtersChange.emit(this.filters);
  }

  onRecipientEmailChange(term: string) {
    this.emailSearch$.next(term);
  }
}