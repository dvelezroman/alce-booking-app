import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterMeetingsDto } from '../../../services/dtos/booking.dto';
import { Stage } from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-meeting-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meeting-filter.component.html',
  styleUrls: ['./meeting-filter.component.scss']
})
export class MeetingFilterComponent {
  @Input() filter!: FilterMeetingsDto;
  @Input() stages: Stage[] = [];
  @Input() availableHours: number[] = [];
  @Input() ageGroupOptions: string[] = [];
  @Output() filterChange = new EventEmitter<FilterMeetingsDto>();

  showForm = true;

  onChange() {
    this.filterChange.emit(this.filter);
 }

  emitFilterChange() {
    this.filterChange.emit({ ...this.filter });
  }

  toggleFormVisibility() {
    this.showForm = !this.showForm;
  }

  get filteredStages(): Stage[] {
    return this.stages.filter(stage => {
      const n = (stage?.number || '').trim().toUpperCase();
      return n === 'STG 0' || /^STG (?:[1-9]|1[0-9])$/.test(n);
    });
  }

  get selectedStageLabel(): string | null {
    if (!this.filter.stageId) return null;
    const stageIdNumber = Number(this.filter.stageId);
    const stage = this.stages.find(s => s.id == stageIdNumber);
    return stage?.description || null;
  }

  get activeFiltersSummary(): string {
    const parts: string[] = [];

    if (this.filter.from) parts.push(`Desde: ${this.filter.from}`);
    if (this.filter.to) parts.push(`Hasta: ${this.filter.to}`);
    if (this.selectedStageLabel) parts.push(this.selectedStageLabel);
    if (this.filter.hour) parts.push(`${this.filter.hour}:00`);
    if (this.filter.category) parts.push(this.filter.category);

    return parts.join(' • ');
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.filter.from ||
      this.filter.to ||
      this.filter.stageId ||
      this.filter.hour ||
      this.filter.category
    );
  }
}