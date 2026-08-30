import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDto } from '../../../../services/dtos/user.dto';

@Component({
  selector: 'app-student-important-notices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-important-notices.component.html',
  styleUrl: './student-important-notices.component.scss',
})
export class StudentImportantNoticesComponent {

  @Input() userData: UserDto | null = null;
  @Input() isKidsRestrictionActive = false;
  @Input() minHoursRequired: number | null = null;
  @Input() shouldShowAssessmentBanner = false;

  @Output() viewAll = new EventEmitter<void>();

  expandedNotes = new Set<number>();

  toggleNote(index: number): void {
    if (this.expandedNotes.has(index)) {
      this.expandedNotes.delete(index);
      return;
    }

    this.expandedNotes.add(index);
  }

  isNoteExpanded(index: number): boolean {
    return this.expandedNotes.has(index);
  }

  getDisplayNote(note?: string | null): string {
    if (!note?.trim()) {
      return '';
    }

    const trimmedNote = note.trim();

    try {
      const parsed = JSON.parse(trimmedNote);

      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed)
      ) {
        return 'Tienes un nuevo recurso de evaluación disponible. Revisa el material para continuar con tu proceso.';
      }
    } catch (_) {
      // No es JSON, se muestra normalmente.
    }

    return note;
  }

  hasDisplayNote(note?: string | null): boolean {
    return Boolean(
      this.getDisplayNote(note).trim()
    );
  }

  shouldShowNoteToggle(note?: string | null): boolean {
    const displayNote = this.getDisplayNote(note);

    if (!displayNote) {
      return false;
    }

    const plainText = displayNote
      .replace(/<[^>]*>/g, '')
      .replace(/\\n/g, ' ')
      .trim();

    return plainText.length > 220;
  }

  get hasMeetingsAlert(): boolean {
    return Boolean(
      this.userData?.meetingsAlert
    );
  }

  get assessmentResources() {
    return (
      this.userData?.assessmentResources ??
      []
    );
  }

  get hasAssessmentResources(): boolean {
    return this.assessmentResources.length > 0;
  }

  get hasAnyNotice(): boolean {
    return (
      this.isKidsRestrictionActive ||
      this.hasMeetingsAlert ||
      (
        this.shouldShowAssessmentBanner &&
        this.hasAssessmentResources
      )
    );
  }

  handleViewAll(): void {
    this.viewAll.emit();
  }

  openResourceLink(link?: string): void {
    if (!link?.trim()) {
      return;
    }

    const formattedLink = link.startsWith('http')
      ? link
      : `https://${link}`;

    try {
      const url = new URL(formattedLink);

      window.open(
        url.toString(),
        '_blank',
        'noopener,noreferrer'
      );
    } catch (_) {
      console.warn(
        'El enlace del recurso no es válido'
      );
    }
  }
}