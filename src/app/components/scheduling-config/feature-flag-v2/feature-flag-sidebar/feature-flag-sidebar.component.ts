import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';


export type FeatureFlagSection =
  | 'general'
  | 'restrictions';


@Component({
  selector: 'app-feature-flag-sidebar',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './feature-flag-sidebar.component.html',
  styleUrl: './feature-flag-sidebar.component.scss',
})
export class FeatureFlagSidebarComponent {

  @Input()
  activeSection:
    FeatureFlagSection =
      'general';

  @Output()
  sectionChange =
    new EventEmitter<
      FeatureFlagSection
    >();


  selectSection(
    section:
      FeatureFlagSection,
  ): void {

    this.sectionChange.emit(
      section,
    );
  }
}