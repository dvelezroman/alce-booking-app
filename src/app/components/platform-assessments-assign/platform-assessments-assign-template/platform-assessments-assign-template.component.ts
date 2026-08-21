import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  FormsModule,
} from '@angular/forms';

import {
  RemoteTemplateItem,
} from '../../../services/dtos/platform-assessment.dto';

@Component({
  selector: 'app-platform-assessments-assign-template',
  standalone: true,
  imports: [
    FormsModule,
  ],
  templateUrl: './platform-assessments-assign-template.component.html',
  styleUrl: './platform-assessments-assign-template.component.scss',
})
export class PlatformAssessmentsAssignTemplateComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  templates: RemoteTemplateItem[] = [];

  @Input()
  templatesLoading = false;

  @Input()
  templateSearch = '';

  @Input()
  selectedTemplateId = '';

  @Input()
  selectedTemplate: RemoteTemplateItem | null = null;


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  templateSearchChange =
    new EventEmitter<string>();

  @Output()
  templateSelected =
    new EventEmitter<string>();

  @Output()
  searchRequested =
    new EventEmitter<void>();


  /* =========================
     EVENTS
  ========================= */

  onTemplateSearchChange(
    value: string,
  ): void {
    this.templateSearchChange.emit(
      value,
    );
  }


  onSearch(): void {
    this.searchRequested.emit();
  }


  onTemplateSelected(
    templateId: string,
  ): void {
    this.templateSelected.emit(
      templateId,
    );
  }


  /* =========================
     TEMPLATE
  ========================= */

  getTemplateLabel(
    template: RemoteTemplateItem,
  ): string {
    return (
      `${template.title} ` +
      `(Stage ${template.targetStage} · ` +
      `${template.timeLimitMinutes} min · ` +
      `aprobar ${template.passingScorePercent}%)`
    );
  }


  /* =========================
     RULES
  ========================= */

  get hasRules(): boolean {
    return !!(
      this.selectedTemplate
        ?.stages
        ?.length
    );
  }

}