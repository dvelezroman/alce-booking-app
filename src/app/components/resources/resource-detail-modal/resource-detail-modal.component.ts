import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  AssessmentResourceI
} from '../../../services/dtos/assessment-resources.dto';

@Component({
  selector: 'app-resource-detail-modal',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './resource-detail-modal.component.html',
  styleUrl: './resource-detail-modal.component.scss'
})
export class ResourceDetailModalComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() show = false;

  @Input() resource: AssessmentResourceI | null = null;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() close = new EventEmitter<void>();


  /* =========================
     CLOSE
  ========================= */

  onClose(): void {
    this.close.emit();
  }


  /* =========================
     BACKDROP
  ========================= */

  onBackdropClick(): void {
    this.onClose();
  }


  stopPropagation(
    event: MouseEvent
  ): void {
    event.stopPropagation();
  }


  /* =========================
     HELPERS
  ========================= */

  get resourceNote(): string {

    if (!this.resource) {
      return 'Sin nota registrada';
    }

    const resourceWithNote =
      this.resource as AssessmentResourceI & {
        note?: string;
      };

    return (
      resourceWithNote.note ||
      'Sin nota registrada'
    );
  }

}