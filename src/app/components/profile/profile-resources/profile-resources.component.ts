import {
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserDto } from '../../../services/dtos/user.dto';

type ProfileResource = {
  id: number;
  title: string;
  link: string;
  note?: string | null;
  description?: string | null;
};

@Component({
  selector: 'app-profile-resources',
  standalone: true,
  imports: [CommonModule],
  templateUrl:
    './profile-resources.component.html',
  styleUrl:
    './profile-resources.component.scss',
})
export class ProfileResourcesComponent {
  @Input() user: UserDto | null = null;

  @Input() resources: ProfileResource[] = [];

  readonly visibleResourcesLimit = 2;

  get isStudent(): boolean {
    return (
      this.user?.role
        ?.toString()
        .trim()
        .toUpperCase() === 'STUDENT'
    );
  }

  get resourcesMessage(): string {
    if (!this.isStudent) {
      return 'Información disponible solo para estudiantes';
    }

    return this.hasResources
      ? 'Recursos académicos disponibles'
      : 'No hay recursos disponibles';
  }

  get resourcesDescription(): string {
    if (!this.isStudent) {
      return 'Los recursos de evaluación corresponden únicamente al perfil académico del estudiante.';
    }

    return this.hasResources
      ? 'Consulta los materiales asignados para tus evaluaciones.'
      : 'Actualmente no tienes recursos de evaluación asignados.';
  }

  get statusType():
    | 'available'
    | 'empty'
    | 'informative' {
    if (!this.isStudent) {
      return 'informative';
    }

    return this.hasResources
      ? 'available'
      : 'empty';
  }

  get visibleResources(): ProfileResource[] {
    if (!this.isStudent) {
      return [];
    }

    return this.resources.slice(
      0,
      this.visibleResourcesLimit
    );
  }

  get hasResources(): boolean {
    return (
      this.isStudent &&
      this.resources.length > 0
    );
  }

  get hasMoreResources(): boolean {
    return (
      this.isStudent &&
      this.resources.length >
        this.visibleResourcesLimit
    );
  }

  getResourceDescription(
    resource: ProfileResource
  ): string {
    return (
      resource.description?.trim() ||
      resource.note?.trim() ||
      'Recurso de evaluación'
    );
  }

  getResourceNumber(
    resource: ProfileResource,
    index: number
  ): string {
    const titleMatch =
      resource.title.match(/\d+/);

    if (titleMatch?.[0]) {
      return titleMatch[0].padStart(
        2,
        '0'
      );
    }

    return String(index + 1).padStart(
      2,
      '0'
    );
  }

  openResource(
    resource: ProfileResource
  ): void {
    if (!this.isStudent) {
      return;
    }

    const link = resource.link?.trim();

    if (!link) {
      return;
    }

    window.open(
      link,
      '_blank',
      'noopener,noreferrer'
    );
  }

  openAllResources(): void {
    if (!this.isStudent) {
      return;
    }

    const firstResource =
      this.resources[0];

    const link =
      firstResource?.link?.trim();

    if (!link) {
      return;
    }

    window.open(
      link,
      '_blank',
      'noopener,noreferrer'
    );
  }

  trackByResourceId(
    _index: number,
    resource: ProfileResource
  ): number {
    return resource.id;
  }
}