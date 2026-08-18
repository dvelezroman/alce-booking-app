import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-links-summary',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './links-summary.component.html',
  styleUrl: './links-summary.component.scss'
})
export class LinksSummaryComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() totalLinks = 0;
  @Input() linksWithPassword = 0;
  @Input() linksWithoutPassword = 0;
  @Input() passwordCoveragePercentage = 0;
  @Input() latestLinkDescription = 'Sin registros';

}