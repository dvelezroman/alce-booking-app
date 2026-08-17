import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-stages-header',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './stages-header.component.html',
  styleUrl: './stages-header.component.scss',
})
export class StagesHeaderComponent {

  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  createRequested =
    new EventEmitter<void>();


  /* =========================
     ACTIONS
  ========================= */

  onCreate(): void {
    this.createRequested.emit();
  }
}