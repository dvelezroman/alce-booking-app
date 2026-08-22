import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface EmailHistoryFilters {
  recipientType: string;
  recipientEmail: string;
  status: string;
  createdAtFrom: string;
  createdAtTo: string;
}

@Component({
  selector: 'app-email-history-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl:
    './email-history-filters.component.html',
  styleUrl:
    './email-history-filters.component.scss',
})
export class EmailHistoryFiltersComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  filters: EmailHistoryFilters = {
    recipientType: '',
    recipientEmail: '',
    status: '',
    createdAtFrom: '',
    createdAtTo: '',
  };


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  filtersChange =
    new EventEmitter<EmailHistoryFilters>();


  /* =========================
     LOCAL STATE
  ========================= */

  localFilters: EmailHistoryFilters = {
    recipientType: '',
    recipientEmail: '',
    status: '',
    createdAtFrom: '',
    createdAtTo: '',
  };


  /* =========================
     INIT INPUT
  ========================= */

  ngOnChanges(): void {
    this.localFilters = {
      ...this.filters,
    };
  }


  /* =========================
     APPLY
  ========================= */

  applyFilters(): void {
    this.filtersChange.emit({
      ...this.localFilters,
    });
  }


  /* =========================
     CLEAR
  ========================= */

  clearFilters(): void {
    this.localFilters = {
      recipientType: '',
      recipientEmail: '',
      status: '',
      createdAtFrom: '',
      createdAtTo: '',
    };

    this.filtersChange.emit({
      ...this.localFilters,
    });
  }


  /* =========================
     ENTER
  ========================= */

  onEmailEnter(): void {
    this.applyFilters();
  }
}