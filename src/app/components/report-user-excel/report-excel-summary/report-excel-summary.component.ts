import {
  Component,
  Input,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

export type ReportExcelMode =
  | 'users'
  | 'absents'
  | 'without-meetings';

export interface ReportExcelSummaryGroup {
  title: string;
  fields: string[];
}

@Component({
  selector: 'app-report-excel-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './report-excel-summary.component.html',
  styleUrl: './report-excel-summary.component.scss',
})
export class ReportExcelSummaryComponent {

  @Input() currentMode: ReportExcelMode =
    'users';


  /* =========================
     TITLE
  ========================= */

  get title(): string {
    return '¿Qué incluye este reporte?';
  }


  /* =========================
     DESCRIPTION
  ========================= */

  get description(): string {
    switch (this.currentMode) {

      case 'absents':
        return 'El archivo Excel incluirá información del estudiante, Stage, instructor y datos de la reunión donde se registró la inasistencia.';

      case 'without-meetings':
        return 'El archivo Excel incluirá estudiantes sin clases agendadas junto con sus datos personales, académicos y de seguimiento.';

      case 'users':
      default:
        return 'El archivo Excel incluirá información completa de los usuarios, datos personales, académicos, contacto, Stage e información asociada a estudiantes e instructores.';
    }
  }


  /* =========================
     REPORT LABEL
  ========================= */

  get reportLabel(): string {
    switch (this.currentMode) {

      case 'absents':
        return 'Estudiantes ausentes';

      case 'without-meetings':
        return 'Estudiantes sin clases agendadas';

      case 'users':
      default:
        return 'Usuarios';
    }
  }


  /* =========================
     TOTAL COLUMNS
  ========================= */

  get totalColumns(): number {
    return this.groups.reduce(
      (total, group) =>
        total + group.fields.length,
      0,
    );
  }


  /* =========================
     GROUPS
  ========================= */

  get groups(): ReportExcelSummaryGroup[] {
    switch (this.currentMode) {

      case 'absents':
        return this.absentGroups;

      case 'without-meetings':
        return this.withoutMeetingsGroups;

      case 'users':
      default:
        return this.usersGroups;
    }
  }


  /* =========================
     USERS REPORT
  ========================= */

  private get usersGroups():
    ReportExcelSummaryGroup[] {

    return [
      {
        title: 'Datos personales',
        fields: [
          'ID Usuario',
          'Número ID',
          'Email',
          'Email Alternativo',
          'Nombre',
          'Apellido',
          'Fecha Nacimiento',
          'Edad',
          'Ocupación',
        ],
      },
      {
        title: 'Cuenta y contacto',
        fields: [
          'Rol',
          'Estado',
          'Estado de Agendamiento',
          'Registrado',
          'Ciudad',
          'País',
          'Contacto',
          'Comentario',
          'Comentario Temporal',
          'Fecha Creación',
          'Fecha Actualización',
        ],
      },
      {
        title: 'Información del estudiante',
        fields: [
          'ID Estudiante',
          'Número Stage',
          'Descripción Stage',
          'Porcentaje Progreso',
          'Clasificación Estudiante',
          'Modo Estudiante',
          'Fecha Inicio Clases',
          'Fecha Fin Clases',
        ],
      },
      {
        title: 'Tutor',
        fields: [
          'Menor de 18',
          'Nombre Tutor',
          'Email Tutor',
          'Teléfono Tutor',
        ],
      },
      {
        title: 'Información del instructor',
        fields: [
          'ID Instructor',
          'Stages Instructor',
          'Link Reunión',
        ],
      },
    ];
  }


  /* =========================
     ABSENTS REPORT
  ========================= */

  private get absentGroups():
    ReportExcelSummaryGroup[] {

    return [
      {
        title: 'Estudiante',
        fields: [
          'ID Estudiante',
          'Nombre Estudiante',
          'Email Estudiante',
          'Contacto Estudiante',
        ],
      },
      {
        title: 'Stage',
        fields: [
          'Número Stage',
          'Descripción Stage',
        ],
      },
      {
        title: 'Instructor',
        fields: [
          'Nombre Instructor',
          'Email Instructor',
        ],
      },
      {
        title: 'Reunión',
        fields: [
          'Fecha Reunión',
          'Hora Reunión',
          'Fecha Local',
          'Hora Local',
          'Tema Reunión',
          'Link Abierto',
        ],
      },
      {
        title: 'Registro',
        fields: [
          'Fecha Creación',
          'Fecha Actualización',
        ],
      },
    ];
  }


  /* =========================
     WITHOUT MEETINGS REPORT
  ========================= */

  private get withoutMeetingsGroups():
    ReportExcelSummaryGroup[] {

    return [
      {
        title: 'Datos personales',
        fields: [
          'Nombre',
          'Apellido',
          'Email',
          'Teléfono',
        ],
      },
      {
        title: 'Información académica',
        fields: [
          'Etapa',
          'Nombre Etapa',
          'Fecha Registro',
          'Estado',
          'Estado de Agendamiento',
        ],
      },
      {
        title: 'Tutor',
        fields: [
          'Tutor Nombre',
          'Tutor Email',
          'Tutor Teléfono',
          'Es Menor de Edad',
        ],
      },
      {
        title: 'Última clase',
        fields: [
          'Última Clase Agendada',
          'Fecha Última Clase',
          'Hora Última Clase',
        ],
      },
      {
        title: 'Seguimiento',
        fields: [
          'Prioridad',
          'Comentario',
          'Comentario Temporal',
        ],
      },
    ];
  }


  /* =========================
     TRACK
  ========================= */

  trackByGroup(
    index: number,
    group: ReportExcelSummaryGroup,
  ): string {
    return group.title;
  }

  trackByField(
    index: number,
    field: string,
  ): string {
    return field;
  }
}