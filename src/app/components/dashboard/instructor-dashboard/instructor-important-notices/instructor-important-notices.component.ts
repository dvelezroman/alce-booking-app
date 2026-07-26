import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type NoticeTone =
  | 'purple'
  | 'yellow'
  | 'green';

type NoticeIcon =
  | 'bell'
  | 'warning'
  | 'book';

type NoticeTag =
  | 'Nuevo'
  | 'Recordatorio'
  | 'Información';

type InstructorNotice = {
  id: number;
  title: string;
  description: string;
  date: string;
  tag: NoticeTag;
  tone: NoticeTone;
  icon: NoticeIcon;
};

@Component({
  selector: 'app-instructor-important-notices',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl:
    './instructor-important-notices.component.html',
  styleUrl:
    './instructor-important-notices.component.scss',
})
export class InstructorImportantNoticesComponent {
  readonly notices: InstructorNotice[] = [
    {
      id: 1,
      title: 'Cambio de horario',
      description:
        'Mañana 21 de mayo habrá cambios en algunos horarios.',
      date: '20 may 2025',
      tag: 'Nuevo',
      tone: 'purple',
      icon: 'bell',
    },
    {
      id: 2,
      title: 'Evaluaciones pendientes',
      description:
        'Tienes 8 evaluaciones pendientes por realizar.',
      date: '19 may 2025',
      tag: 'Recordatorio',
      tone: 'yellow',
      icon: 'warning',
    },
    {
      id: 3,
      title: 'Reunión de instructores',
      description:
        'Este viernes 23 de mayo a las 3:00 PM.',
      date: '18 may 2025',
      tag: 'Información',
      tone: 'green',
      icon: 'book',
    },
  ];

  trackByNoticeId(
    index: number,
    notice: InstructorNotice
  ): number {
    return notice.id;
  }

  onViewAll(): void {
    console.log('Ver todos los avisos');
  }

  onNoticeClick(
    notice: InstructorNotice
  ): void {
    console.log(
      'Aviso seleccionado:',
      notice
    );
  }
}