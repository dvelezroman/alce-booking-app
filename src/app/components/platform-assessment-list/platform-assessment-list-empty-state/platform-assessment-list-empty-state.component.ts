import {
  Component,
  Input,
} from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-platform-assessment-list-empty-state',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './platform-assessment-list-empty-state.component.html',
  styleUrl: './platform-assessment-list-empty-state.component.scss',
})
export class PlatformAssessmentListEmptyStateComponent {

  @Input()
  errorMessage = '';


  get hasError(): boolean {
    return !!this.errorMessage?.trim();
  }


  get title(): string {
    return this.hasError
      ? 'No se pudo cargar el listado'
      : 'No hay evaluaciones para mostrar';
  }


  get description(): string {
    return this.hasError
      ? this.errorMessage
      : 'No existen evaluaciones de plataforma que coincidan con los filtros seleccionados.';
  }
}