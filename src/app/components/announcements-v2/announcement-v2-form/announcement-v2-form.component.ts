import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  FormsModule,
} from '@angular/forms';

import {
  UserRole,
} from '../../../services/dtos/user.dto';

import {
  StudentClassification,
} from '../../../services/dtos/student.dto';


type AnnouncementType =
  | 'promotion'
  | 'notice'
  | 'relocation';

type AnnouncementShowMode =
  | 'always'
  | 'once_session'
  | 'once_user';

type AnnouncementAspectRatio =
  | 'horizontal'
  | 'vertical'
  | 'square';


@Component({
  selector: 'app-announcement-v2-form',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
  ],

  templateUrl:
    './announcement-v2-form.component.html',

  styleUrl:
    './announcement-v2-form.component.scss',
})
export class AnnouncementV2FormComponent {

  /* =========================================================
     INPUTS
  ========================================================= */

  @Input()
  title:
    string = '';

  @Input()
  type:
    AnnouncementType | null = null;

  @Input()
  role:
    UserRole | null = null;

  @Input()
  classification:
    StudentClassification | null = null;

  @Input()
  city:
    | 'Portoviejo'
    | 'Cuenca'
    | null = null;

  @Input()
  isActive:
    boolean = true;

  @Input()
  startDate?: string;

  @Input()
  endDate?: string;

  @Input()
  showMode:
    AnnouncementShowMode =
      'always';

  @Input()
  aspectRatio:
    AnnouncementAspectRatio =
      'horizontal';


  /* =========================================================
     OUTPUTS
  ========================================================= */

  @Output()
  titleChange =
    new EventEmitter<string>();

  @Output()
  typeChange =
    new EventEmitter<
      AnnouncementType | null
    >();

  @Output()
  roleChange =
    new EventEmitter<
      UserRole | null
    >();

  @Output()
  classificationChange =
    new EventEmitter<
      StudentClassification | null
    >();

  @Output()
  cityChange =
    new EventEmitter<
      | 'Portoviejo'
      | 'Cuenca'
      | null
    >();

  @Output()
  isActiveChange =
    new EventEmitter<boolean>();

  @Output()
  startDateChange =
    new EventEmitter<
      string | undefined
    >();

  @Output()
  endDateChange =
    new EventEmitter<
      string | undefined
    >();

  @Output()
  showModeChange =
    new EventEmitter<
      AnnouncementShowMode
    >();

  @Output()
  aspectRatioChange =
    new EventEmitter<
      AnnouncementAspectRatio
    >();


  /* =========================================================
     OPTIONS
  ========================================================= */

  readonly typeOptions: {
    value: AnnouncementType;
    label: string;
  }[] = [
    {
      value: 'promotion',
      label: 'Promoción',
    },
    {
      value: 'notice',
      label: 'Aviso',
    },
    {
      value: 'relocation',
      label: 'Reubicación',
    },
  ];


  readonly roleOptions: {
    value: UserRole;
    label: string;
  }[] = [
    {
      value: UserRole.STUDENT,
      label: 'Estudiantes',
    },
    {
      value: UserRole.INSTRUCTOR,
      label: 'Instructores',
    },
    {
      value: UserRole.ADMIN,
      label: 'Administradores',
    },
  ];


  readonly classificationOptions: {
    value: StudentClassification;
    label: string;
  }[] = [
    {
      value: StudentClassification.KIDS,
      label: 'Kids',
    },
    {
      value: StudentClassification.TEENS,
      label: 'Teens',
    },
    {
      value: StudentClassification.ADULTS,
      label: 'Adults',
    },
  ];


  readonly cityOptions: {
    value:
      | 'Portoviejo'
      | 'Cuenca';
    label: string;
  }[] = [
    {
      value: 'Portoviejo',
      label: 'Portoviejo',
    },
    {
      value: 'Cuenca',
      label: 'Cuenca',
    },
  ];


  readonly showModeOptions: {
    value: AnnouncementShowMode;
    label: string;
  }[] = [
    {
      value: 'always',
      label: 'Siempre',
    },
    {
      value: 'once_session',
      label: 'Una vez por sesión',
    },
    {
      value: 'once_user',
      label: 'Una vez por usuario',
    },
  ];


  readonly aspectRatioOptions: {
    value: AnnouncementAspectRatio;
    label: string;
  }[] = [
    {
      value: 'horizontal',
      label: 'Horizontal (16:9)',
    },
    {
      value: 'vertical',
      label: 'Vertical',
    },
    {
      value: 'square',
      label: 'Cuadrado (1:1)',
    },
  ];


  /* =========================================================
     STATE
  ========================================================= */

  get disableStudentFilters(): boolean {

    return (
      this.role ===
        UserRole.ADMIN ||
      this.role ===
        UserRole.INSTRUCTOR
    );
  }


  /* =========================================================
     EVENTS
  ========================================================= */

  onTitleChange(
    value: string,
  ): void {

    this.titleChange.emit(
      value,
    );
  }


  onTypeChange(
    value: string,
  ): void {

    this.typeChange.emit(
      value
        ? value as AnnouncementType
        : null,
    );
  }


  onRoleChange(
    value: string,
  ): void {

    const role =
      value
        ? value as UserRole
        : null;

    this.roleChange.emit(
      role,
    );


    if (
      role === UserRole.ADMIN ||
      role === UserRole.INSTRUCTOR
    ) {

      this.classificationChange.emit(
        null,
      );
    }
  }


  onClassificationChange(
    value: string,
  ): void {

    this.classificationChange.emit(
      value
        ? value as StudentClassification
        : null,
    );
  }


  onCityChange(
    value: string,
  ): void {

    this.cityChange.emit(
      value
        ? value as
            | 'Portoviejo'
            | 'Cuenca'
        : null,
    );
  }


  onActiveChange(
    checked: boolean,
  ): void {

    this.isActiveChange.emit(
      checked,
    );
  }


  onStartDateChange(
    value: string,
  ): void {

    this.startDateChange.emit(
      value || undefined,
    );
  }


  onEndDateChange(
    value: string,
  ): void {

    this.endDateChange.emit(
      value || undefined,
    );
  }


  onShowModeChange(
    value: string,
  ): void {

    this.showModeChange.emit(
      value as AnnouncementShowMode,
    );
  }


  onAspectRatioChange(
    value: string,
  ): void {

    this.aspectRatioChange.emit(
      value as AnnouncementAspectRatio,
    );
  }

}