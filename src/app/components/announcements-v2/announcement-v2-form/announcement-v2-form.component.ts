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

import {
  AnnouncementShowSchedule,
} from '../../../services/dtos/announcement.dto';


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

type AnnouncementDisplayMode =
  | 'modal'
  | 'banner'
  | 'both';

type AnnouncementBannerTone =
  | 'brand'
  | 'accent'
  | 'info'
  | 'warning';


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
  message:
    string = '';

  @Input()
  displayMode:
    AnnouncementDisplayMode = 'modal';

  @Input()
  bannerTone:
    AnnouncementBannerTone = 'accent';

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
  showSchedule:
    AnnouncementShowSchedule | null = null;

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
  messageChange =
    new EventEmitter<string>();

  @Output()
  displayModeChange =
    new EventEmitter<AnnouncementDisplayMode>();

  @Output()
  bannerToneChange =
    new EventEmitter<AnnouncementBannerTone>();

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
  showScheduleChange =
    new EventEmitter<
      AnnouncementShowSchedule | null
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


  readonly displayModeOptions: {
    value: AnnouncementDisplayMode;
    label: string;
  }[] = [
    {
      value: 'modal',
      label: 'Modal (popup)',
    },
    {
      value: 'banner',
      label: 'Banner en dashboard',
    },
    {
      value: 'both',
      label: 'Modal + banner',
    },
  ];

  readonly bannerToneOptions: {
    value: AnnouncementBannerTone;
    label: string;
  }[] = [
    {
      value: 'accent',
      label: 'Naranja (destacado)',
    },
    {
      value: 'brand',
      label: 'Azul institucional',
    },
    {
      value: 'info',
      label: 'Informativo',
    },
    {
      value: 'warning',
      label: 'Advertencia',
    },
  ];

  readonly repeatKindOptions: {
    value:
      | 'none'
      | 'daily'
      | 'every_n_days'
      | 'weekly'
      | 'monthly';
    label: string;
  }[] = [
    {
      value: 'none',
      label: 'No se repite',
    },
    {
      value: 'daily',
      label: 'Cada día',
    },
    {
      value: 'every_n_days',
      label: 'Cada N días',
    },
    {
      value: 'weekly',
      label: 'Semanal',
    },
    {
      value: 'monthly',
      label: 'Mensual',
    },
  ];

  readonly weekdayOptions: {
    value: number;
    label: string;
  }[] = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 7, label: 'Domingo' },
  ];

  readonly monthDays: number[] =
    Array.from({ length: 31 }, (_, index) => index + 1);

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

  get showsBannerFields(): boolean {
    return (
      this.displayMode === 'banner' ||
      this.displayMode === 'both'
    );
  }

  get showsModalFields(): boolean {
    return (
      this.displayMode === 'modal' ||
      this.displayMode === 'both'
    );
  }

  get repeatKind():
    | 'none'
    | 'daily'
    | 'every_n_days'
    | 'weekly'
    | 'monthly' {
    return this.showSchedule?.kind ?? 'none';
  }

  get intervalDays(): number {
    return this.showSchedule?.kind === 'every_n_days'
      ? this.showSchedule.intervalDays
      : 2;
  }

  get weekday(): number {
    return this.showSchedule?.kind === 'weekly'
      ? this.showSchedule.weekday
      : 1;
  }

  get selectedMonthDays(): number[] {
    return this.showSchedule?.kind === 'monthly'
      ? this.showSchedule.daysOfMonth
      : [];
  }

  get limitMonthlyOccurrences(): boolean {
    return (
      this.showSchedule?.kind === 'monthly' &&
      this.showSchedule.maxOccurrencesPerMonth != null
    );
  }

  get maxOccurrencesPerMonth(): number {
    if (
      this.showSchedule?.kind === 'monthly' &&
      this.showSchedule.maxOccurrencesPerMonth
    ) {
      return this.showSchedule.maxOccurrencesPerMonth;
    }
    return 1;
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


  onMessageChange(
    value: string,
  ): void {

    this.messageChange.emit(
      value,
    );
  }


  onDisplayModeChange(
    value: string,
  ): void {

    this.displayModeChange.emit(
      value as AnnouncementDisplayMode,
    );
  }


  onBannerToneChange(
    value: string,
  ): void {

    this.bannerToneChange.emit(
      value as AnnouncementBannerTone,
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

  onRepeatKindChange(value: string): void {
    switch (value) {
      case 'daily':
        this.showScheduleChange.emit({ kind: 'daily' });
        return;
      case 'every_n_days':
        this.showScheduleChange.emit({
          kind: 'every_n_days',
          intervalDays: Math.max(1, this.intervalDays || 1),
        });
        return;
      case 'weekly':
        this.showScheduleChange.emit({
          kind: 'weekly',
          weekday: this.weekday || 1,
        });
        return;
      case 'monthly':
        this.showScheduleChange.emit({
          kind: 'monthly',
          daysOfMonth: this.selectedMonthDays.length
            ? [...this.selectedMonthDays]
            : [1],
        });
        return;
      default:
        this.showScheduleChange.emit(null);
    }
  }

  onIntervalDaysChange(value: string): void {
    const parsed = Number(value);
    const intervalDays =
      Number.isFinite(parsed) && parsed >= 1
        ? Math.floor(parsed)
        : 1;

    this.showScheduleChange.emit({
      kind: 'every_n_days',
      intervalDays,
    });
  }

  onWeekdayChange(value: string): void {
    const weekday = Number(value);
    this.showScheduleChange.emit({
      kind: 'weekly',
      weekday: weekday >= 1 && weekday <= 7 ? weekday : 1,
    });
  }

  onToggleMonthDay(day: number): void {
    if (this.showSchedule?.kind !== 'monthly') {
      return;
    }

    const current = this.showSchedule.daysOfMonth;
    const next = current.includes(day)
      ? current.filter((item) => item !== day)
      : [...current, day].sort((a, b) => a - b);

    if (next.length === 0) {
      return;
    }

    this.showScheduleChange.emit({
      kind: 'monthly',
      daysOfMonth: next,
      ...(this.showSchedule.maxOccurrencesPerMonth != null
        ? {
            maxOccurrencesPerMonth:
              this.showSchedule.maxOccurrencesPerMonth,
          }
        : {}),
    });
  }

  onLimitOccurrencesChange(checked: boolean): void {
    if (this.showSchedule?.kind !== 'monthly') {
      return;
    }

    this.showScheduleChange.emit(
      checked
        ? {
            kind: 'monthly',
            daysOfMonth: [...this.showSchedule.daysOfMonth],
            maxOccurrencesPerMonth: this.maxOccurrencesPerMonth || 1,
          }
        : {
            kind: 'monthly',
            daysOfMonth: [...this.showSchedule.daysOfMonth],
          },
    );
  }

  onMaxOccurrencesChange(value: string): void {
    if (this.showSchedule?.kind !== 'monthly') {
      return;
    }

    const parsed = Number(value);
    const maxOccurrencesPerMonth =
      Number.isFinite(parsed) && parsed >= 1
        ? Math.floor(parsed)
        : 1;

    this.showScheduleChange.emit({
      kind: 'monthly',
      daysOfMonth: [...this.showSchedule.daysOfMonth],
      maxOccurrencesPerMonth,
    });
  }

  isMonthDaySelected(day: number): boolean {
    return this.selectedMonthDays.includes(day);
  }


  onAspectRatioChange(
    value: string,
  ): void {

    this.aspectRatioChange.emit(
      value as AnnouncementAspectRatio,
    );
  }

}