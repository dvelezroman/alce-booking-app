import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FilterMeetingsDto } from '../../../services/dtos/booking.dto';
import { Mode, Stage } from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-instructor-meetings-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './instructor-meetings-filters.component.html',
  styleUrl: './instructor-meetings-filters.component.scss',
})
export class InstructorMeetingsFiltersComponent {
  @Input() filter!: FilterMeetingsDto;
  @Input() stages: Stage[] = [];
  @Input() availableHours: number[] = [];
  @Input() ageGroupOptions: string[] = [];
  @Input() isLoading: boolean = false;

  readonly modeOptions: { value: Mode; label: string }[] = [
    { value: Mode.ONLINE, label: 'Online' },
    { value: Mode.PRESENCIAL, label: 'Presencial' },
    { value: Mode.SEMIPRESENCIAL, label: 'Semipresencial' },
  ];

  @Output() filterChange = new EventEmitter<void>();

  @Output() clearFilters = new EventEmitter<void>();

  onSearch(): void {
    if (this.isLoading) return;

    this.filterChange.emit();
  }

  onClearFilters(): void {
    if (this.isLoading) return;

    this.clearFilters.emit();
  }

  onEnterPressed(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    this.onSearch();
  }

  get isSearchDisabled(): boolean {
    return this.isLoading;
  }

  trackByStageId(index: number, stage: Stage): number {
    return stage.id;
  }

  trackByHour(index: number, hour: number): number {
    return hour;
  }

  trackByAgeGroup(index: number, ageGroup: string): string {
    return ageGroup;
  }

  trackByMode(index: number, modeOption: { value: Mode; label: string }): Mode {
    return modeOption.value;
  }

  formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;

    return `${normalizedHour.toString().padStart(2, '0')}:00 ${period}`;
  }

  formatStageLabel(stage: Stage): string {
    const number = stage.number ? `Stage ${stage.number}` : 'Stage';
    const description = stage.description ? ` - ${stage.description}` : '';

    return `${number}${description}`;
  }
}