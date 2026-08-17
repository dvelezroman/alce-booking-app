import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-links-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './links-filters.component.html',
  styleUrl: './links-filters.component.scss',
})
export class LinksFiltersComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  searchTerm = '';

  @Input()
  total = 0;


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  searchTermChange =
    new EventEmitter<string>();

  @Output()
  clearRequested =
    new EventEmitter<void>();


  /* =========================
     SEARCH
  ========================= */

  onSearchChange(
    value: string,
  ): void {
    this.searchTerm = value;

    this.searchTermChange.emit(
      value || '',
    );
  }


  /* =========================
     CLEAR
  ========================= */

  clearSearch(): void {
    this.searchTerm = '';

    this.clearRequested.emit();
  }


  /* =========================
     STATE
  ========================= */

  get hasSearch(): boolean {
    return !!this.searchTerm.trim();
  }
}