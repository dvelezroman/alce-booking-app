import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentResourceI } from '../../services/dtos/assessment-resources.dto';
import { AssessementI } from '../../services/dtos/assessment.dto';

@Component({
  selector: 'app-student-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-banner.component.html',
  styleUrls: ['./student-banner.component.scss']
})
export class StudentBannerComponent {
  @Input() type: 'warning' | 'info' = 'info';
  @Input() title: string = '';
  @Input() text: string = '';
  @Input() icon: string = 'info';
  // @Input() resources: AssessmentResourceI[] = [];
  @Input() assessments: AssessementI[] = [];
  isExpanded = true;

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  get relevantAssessments() {
  return this.assessments?.filter(a => a.note?.trim() || (a.resources?.length ?? 0) > 0) ?? [];
}
}