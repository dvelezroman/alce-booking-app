import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LuxonDateOnlyPipe } from '../utils/luxon-date-only.pipe';


@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, LuxonDateOnlyPipe ],
  templateUrl: './table.component.html',
   styleUrls: ['./table.component.scss'] 
})
export class TableComponent implements OnChanges {
  @Input() columns: string[] = [];
  @Input() data: any[] = [];

   // Etiquetas legibles de columnas
  @Input() columnLabels: Record<string, string> = {};

  // Checkboxes
  @Input() selectable: boolean = false;
  @Input() isCheckboxDisabled: (item: any) => boolean = () => false;
  @Input() selectedItems: any[] = [];
  @Output() selectionChanged = new EventEmitter<any[]>();

  // Acciones
  @Input() showActions: boolean = false;
  @Input() actions: ('edit' | 'delete' | 'view')[] = [];
  @Output() actionClicked = new EventEmitter<{ action: string; item: any }>();

  // Paginación
  @Input() manualPagination: boolean = false;
  @Input() itemsPerPage: number = 5;

  currentPage = 1;
  paginatedData: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['itemsPerPage']) {
      this.updatePagination();
    }
  }

  updatePagination(): void {
    if (this.manualPagination) {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      this.paginatedData = this.data.slice(start, end);
    } else {
      this.paginatedData = this.data;
    }
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  get totalPages(): number {
    return Math.ceil(this.data.length / this.itemsPerPage);
  }

  toggleSelection(item: any): void {
    const index = this.selectedItems.indexOf(item);
    if (index === -1) {
      this.selectedItems.push(item);
    } else {
      this.selectedItems.splice(index, 1);
    }
    this.selectionChanged.emit(this.selectedItems);
  }

  isSelected(item: any): boolean {
    return this.selectedItems.includes(item);
  }

  selectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedItems = checked ? [...this.paginatedData] : [];
    this.selectionChanged.emit(this.selectedItems);
  }

  onActionClick(action: string, item: any): void {
    this.actionClicked.emit({ action, item });
  }

  getObjectKeys(item: any): string[] {
    return Object.keys(item);
  }

  isDateField(value: any): boolean {
    return typeof value === 'string' && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
  }

  getColumnLabel(key: string): string {
    return this.columnLabels[key] || this.toTitleCase(key);
  }

  private toTitleCase(text: string): string {
    return text
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1));
  }
}
