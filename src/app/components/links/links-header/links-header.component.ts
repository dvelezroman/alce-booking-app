import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-links-header',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './links-header.component.html',
  styleUrl: './links-header.component.scss',
})
export class LinksHeaderComponent {

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