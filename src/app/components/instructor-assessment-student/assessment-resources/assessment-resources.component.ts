import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import {
  AssessmentResourceI,
} from '../../../services/dtos/assessment-resources.dto';


@Component({
  selector: 'app-assessment-resources',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './assessment-resources.component.html',
  styleUrl: './assessment-resources.component.scss',
})
export class AssessmentResourcesComponent {

  /* =========================
     INPUT
  ========================= */

  @Input() resources: AssessmentResourceI[] = [];


  /* =========================
     STATE
  ========================= */

  get hasResources(): boolean {
    return this.resources.length > 0;
  }


  get totalResources(): number {
    return this.resources.length;
  }


  /* =========================
     RESOURCE DATA
  ========================= */

  getResourceTitle(
    resource: AssessmentResourceI,
  ): string {

    return (
      resource.title?.trim() ||
      'Recurso de refuerzo'
    );
  }


  getResourceDescription(
    resource: AssessmentResourceI,
  ): string {

    const value =
      (resource as any)?.description;

    if (
      typeof value === 'string' &&
      value.trim()
    ) {
      return value.trim();
    }

    return 'Material de apoyo para reforzar el aprendizaje.';
  }


  getResourceLink(
    resource: AssessmentResourceI,
  ): string | null {

    const link =
      resource.link?.trim();

    return link || null;
  }


  /* =========================
     VISUAL TYPE
  ========================= */

  getResourceVisualType(
    resource: AssessmentResourceI,
  ): string {

    const text =
      `${resource.title ?? ''} ${(resource as any)?.description ?? ''}`
        .toLowerCase();

    if (
      text.includes('grammar') ||
      text.includes('gramática')
    ) {
      return 'grammar';
    }

    if (
      text.includes('writing') ||
      text.includes('redacción') ||
      text.includes('escritura')
    ) {
      return 'writing';
    }

    if (
      text.includes('speaking') ||
      text.includes('oral') ||
      text.includes('expresión')
    ) {
      return 'speaking';
    }

    if (
      text.includes('listening') ||
      text.includes('auditiva')
    ) {
      return 'listening';
    }

    if (
      text.includes('reading') ||
      text.includes('lectura')
    ) {
      return 'reading';
    }

    return 'default';
  }


  /* =========================
     OPEN RESOURCE
  ========================= */

  openResource(
    resource: AssessmentResourceI,
  ): void {

    const link =
      this.getResourceLink(resource);

    if (!link) {
      return;
    }

    window.open(
      link,
      '_blank',
      'noopener,noreferrer',
    );
  }


  /* =========================
     TRACK BY
  ========================= */

  trackByResourceId(
    index: number,
    resource: AssessmentResourceI,
  ): number {

    return resource.id;
  }

}