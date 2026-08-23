import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  FeatureFlagDto,
} from '../../../../services/dtos/feature-flag.dto';


@Component({
  selector: 'app-feature-flag-general-settings',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './feature-flag-general-settings.component.html',
  styleUrl: './feature-flag-general-settings.component.scss',
})
export class FeatureFlagGeneralSettingsComponent {

  @Input()
  ffs: FeatureFlagDto[] = [];

  @Input()
  getFlagLabel!: (
    name: string,
  ) => string;

  @Output()
  toggleRequested =
    new EventEmitter<FeatureFlagDto>();

  @Output()
  refreshRequested =
    new EventEmitter<void>();


  onToggle(
    ff: FeatureFlagDto,
  ): void {

    this.toggleRequested.emit(
      ff,
    );
  }


  onRefresh(): void {

    this.refreshRequested.emit();
  }
}