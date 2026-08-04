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
  /** When true (or when API already redacted points), show pass/fail only. */
  @Input() showPassFailOnly = false;

  constructor(private sanitizer: DomSanitizer) {}

  formatNoteWithLinks(note: string | null): SafeHtml {
    if (!note) return 'Sin comentario';

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const html = note.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  get hideNumericScores(): boolean {
    return (
      this.showPassFailOnly ||
      this.assessments.some((a) => a.passed !== undefined && a.points == null)
    );
  }

  isApproved(a: AssessementI): boolean {
    if (a.passed !== undefined) return a.passed;
    if (a.points == null || this.minPointsAssessment === null) return false;
    return a.points >= this.minPointsAssessment;
  }

  isNotApproved(a: AssessementI): boolean {
    if (a.passed !== undefined) return !a.passed;
    if (a.points == null || this.minPointsAssessment === null) return false;
    return a.points < this.minPointsAssessment;
  }

  resultLabel(a: AssessementI): string {
    if (this.isApproved(a)) return 'Aprobado';
    if (this.isNotApproved(a)) return 'No aprobado';
    return a.points != null ? String(a.points) : '—';
  }
}
