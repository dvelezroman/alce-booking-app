import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-content-header',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './content-header.component.html',
  styleUrl: './content-header.component.scss',
})
export class ContentHeaderComponent {

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