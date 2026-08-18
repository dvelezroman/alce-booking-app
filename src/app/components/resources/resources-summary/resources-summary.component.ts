import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-resources-summary',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './resources-summary.component.html',
  styleUrl: './resources-summary.component.scss'
})
export class ResourcesSummaryComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() totalResources = 0;

  @Input() activeResources = 0;

  @Input() resourcesWithLink = 0;


  /* =========================
     HELPERS
  ========================= */

  get activePercentage(): number {
    if (this.totalResources === 0) {
      return 0;
    }

    return Math.round(
      (this.activeResources / this.totalResources) * 100
    );
  }

}