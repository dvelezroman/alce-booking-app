import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRole } from '../../../services/dtos/user.dto';
import { StudentClassification } from '../../../services/dtos/student.dto';
import { Action } from '../../../services/dtos/announcement.dto';

type ActionType = Action['type'];

@Component({
  selector: 'app-preview-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-card.component.html',
  styleUrl: './preview-card.component.scss',
})
export class PreviewCardComponent {

  @Input() title!: string;
  @Input() type!: string;
  @Input() image?: string;

  @Input() role: UserRole | null = null;
  @Input() studentClassification: StudentClassification | null = null;
  @Input() city: 'Portoviejo' | 'Cuenca' | null = null;

  @Input() isActive!: boolean;
  @Input() actions: Action[] = [];

  getActionLabel(action: Action): string {
    if (action.label) return action.label;

    const labels: Record<ActionType, string> = {
      interest: 'Interest',
      lead: 'Lead Form',
      link: 'External Link',
      close: 'Close',
    };

    return labels[action.type];
  }
}