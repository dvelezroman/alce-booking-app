import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessementI } from '../../../services/dtos/assessment.dto';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-assessment-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-table.component.html',
  styleUrls: ['./assessment-table.component.scss']
})
export class AssessmentTableComponent {
  @Input() assessments: AssessementI[] = [];
 @Input() minPointsAssessment: number | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  formatNoteWithLinks(note: string | null): SafeHtml {
    if (!note) return 'Sin comentario';

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const html = note.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  isApproved(points: number): boolean {
    return this.minPointsAssessment !== null && points >= this.minPointsAssessment;
  }

  isNotApproved(points: number): boolean {
    return this.minPointsAssessment !== null && points < this.minPointsAssessment;
  }
}
