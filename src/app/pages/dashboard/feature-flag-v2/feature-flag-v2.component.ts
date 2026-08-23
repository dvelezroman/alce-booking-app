import {
  Component,
  OnInit,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  RouterModule,
} from '@angular/router';

import {
  FormsModule,
} from '@angular/forms';

import {
  catchError,
  EMPTY,
  Observable,
  switchMap,
  tap,
} from 'rxjs';


/* =========================================================
   SERVICES
========================================================= */

import {
  FeatureFlagService,
} from '../../../services/feature-flag.service';

import {
  HandleDatesService,
} from '../../../services/handle-dates.service';


/* =========================================================
   DTOS
========================================================= */

import {
  FeatureFlagDto,
} from '../../../services/dtos/feature-flag.dto';

import {
  City,
  DisabledDatesAndHours,
  DisabledDays,
  SelectedDay,
} from '../../../services/dtos/handle-date.dto';

import {
  Mode,
  StudentClassification,
} from '../../../services/dtos/student.dto';


/* =========================================================
   MODAL
========================================================= */

import {
  ModalDto,
  modalInitializer,
} from '../../../components/modal/modal.dto';

import {
  ModalComponent,
} from '../../../components/modal/modal.component';


/* =========================================================
   FEATURE FLAG V2 COMPONENTS
========================================================= */

import {
  FeatureFlagGeneralSettingsComponent,
} from '../../../components/scheduling-config/feature-flag-v2/feature-flag-general-settings/feature-flag-general-settings.component';

import {
  FeatureFlagRestrictionFiltersComponent,
} from '../../../components/scheduling-config/feature-flag-v2/feature-flag-restriction-filters/feature-flag-restriction-filters.component';

import {
  FeatureFlagCalendarComponent,
} from '../../../components/scheduling-config/feature-flag-v2/feature-flag-calendar/feature-flag-calendar.component';

import {
  FeatureFlagRestrictionsLegendComponent,
} from '../../../components/scheduling-config/feature-flag-v2/feature-flag-restrictions-legend/feature-flag-restrictions-legend.component';

import {
  FeatureFlagRestrictionsTableComponent,
} from '../../../components/scheduling-config/feature-flag-v2/feature-flag-restrictions-table/feature-flag-restrictions-table.component';

import {
  FeatureFlagHoursPanelComponent,
} from '../../../components/scheduling-config/feature-flag-v2/feature-flag-hours-panel/feature-flag-hours-panel.component';


/* =========================================================
   INTERFACES
========================================================= */

interface DayRestrictionInfo {
  day: number;
  month: string;

  entries: {
    hours: number[];

    studentClassification:
      string | null;

    mode:
      string | null;

    city:
      string | null;
  }[];
}


/* =========================================================
   COMPONENT
========================================================= */

@Component({
  selector: 'app-feature-flag-v2',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule,
    FormsModule,

    ModalComponent,

    FeatureFlagGeneralSettingsComponent,
    FeatureFlagRestrictionFiltersComponent,
    FeatureFlagCalendarComponent,
    FeatureFlagRestrictionsLegendComponent,
    FeatureFlagRestrictionsTableComponent,
    FeatureFlagHoursPanelComponent,
  ],

  templateUrl:
    './feature-flag-v2.component.html',

  styleUrl:
    './feature-flag-v2.component.scss',
})
export class FeatureFlagV2Component
  implements OnInit {

  /* =======================================================
     FEATURE FLAGS
  ======================================================= */

  ffs: FeatureFlagDto[] = [];


  /* =======================================================
     CALENDAR
  ======================================================= */

  selectedMonth!: string;

  selectedYear!: number;

  currentMonthDays:
    any[] = [];

  selectedDays:
    SelectedDay[] = [];

  canGoBack = false;

  canGoForward = true;


  /* =======================================================
     DISABLED DATES
  ======================================================= */

  disabledDates:
    DisabledDays = {};

  disabledDatesAndHours:
    DisabledDatesAndHours = {};


  /* =======================================================
     HOURS
  ======================================================= */

  timeSlots: {
    label: string;
    value: number;
    isDisabled?: boolean;
  }[] = [];


  /* =======================================================
     FILTERS
  ======================================================= */

  readonly SELECT_PLACEHOLDER =
    '__SELECT__';

  selectedStudentClassification:
    StudentClassification | null =
      null;

  selectedMode:
    Mode | null =
      null;

  selectedCity:
    City | null =
      null;


  /* =======================================================
     SELECTED RESTRICTIONS
  ======================================================= */

  selectedDaysRestrictions:
    DayRestrictionInfo[] = [];


  /* =======================================================
     MODAL
  ======================================================= */

  modal:
    ModalDto =
      modalInitializer();

  pendingDelete: {
    day: number;
    entry: any;
  } | null = null;


  /* =======================================================
     CONSTRUCTOR
  ======================================================= */

  constructor(
    private readonly ffService:
      FeatureFlagService,

    private readonly handleDatesService:
      HandleDatesService,
  ) {}


  /* =======================================================
     INIT
  ======================================================= */

  ngOnInit(): void {

    this.getAll();

    const today =
      new Date();

    this.selectedMonth =
      today
        .toLocaleString(
          'es-ES',
          {
            month: 'long',
          },
        )
        .toUpperCase();

    this.selectedYear =
      today.getFullYear();

    this.timeSlots =
      this.generateTimeSlots(
        8,
        20,
      );

    this.refreshCalendar();

    this.updateNavigationButtons();
  }


  /* =======================================================
     FEATURE FLAGS
  ======================================================= */

  getAll(): void {

    this.ffService
      .getAll()
      .subscribe(
        ffs => {

          const hidden = [
            'enable-stage-promotion-cron',
          ];

          const orden = [
            'enable-login',
            'enable-schedule',
          ];

          this.ffs =
            ffs
              .filter(
                ff =>
                  !hidden.includes(
                    ff.name,
                  ),
              )
              .sort(
                (a, b) =>
                  orden.indexOf(
                    a.name,
                  ) -
                  orden.indexOf(
                    b.name,
                  ),
              );
        },
      );
  }


  getFlagLabel(
    name: string,
  ): string {

    switch (name) {

      case 'enable-login':
        return 'Habilitar Login';

      case 'enable-schedule':
        return 'Habilitar Agendamiento';

      default:
        return name;
    }
  }


  toggle(
    ff: FeatureFlagDto,
  ): void {

    this.ffService
      .toggle(ff.id)
      .pipe(

        switchMap(
          async () =>
            this.getAll(),
        ),

        catchError(
          () => EMPTY,
        ),
      )
      .subscribe({

        next: () => {

          console.log(
            'Feature flag toggled and list updated',
          );
        },

        error: err => {

          console.error(
            'Subscription error:',
            err,
          );
        },
      });
  }


  /* =======================================================
     DISABLED DATES
  ======================================================= */

  private getDisabledDates():
    Observable<DisabledDatesAndHours> {

    const [
      firstDayOfYear,
      lastDayOfYear,
    ] =
      this.getFirstAndLastDayOfYear();

    return this.handleDatesService
      .getNotAvailableDatesAndHours(
        firstDayOfYear,
        lastDayOfYear,
        this.selectedStudentClassification,
        this.selectedMode,
        this.selectedCity,
      )
      .pipe(

        tap(
          disabledDatesAndHours => {

            this.disabledDatesAndHours =
              disabledDatesAndHours;
          },
        ),
      );
  }


  private getDisabledDatesAndHours():
    Observable<DisabledDatesAndHours> {

    const [
      firstDayOfYear,
      lastDayOfYear,
    ] =
      this.getFirstAndLastDayOfYear();

    console.log(
      'CITY ENVIADA:',
      this.selectedCity,
    );

    return this.handleDatesService
      .getNotAvailableDatesAndHours(
        firstDayOfYear,
        lastDayOfYear,
        this.selectedStudentClassification,
        this.selectedMode,
        this.selectedCity,
      )
      .pipe(

        tap(
          disabledDatesAndHours => {

            this.disabledDatesAndHours =
              disabledDatesAndHours;
          },
        ),
      );
  }


  private getFirstAndLastDayOfYear():
    [string, string] {

    const year =
      this.selectedYear ||
      new Date().getFullYear();

    return [
      `${year}-01-01`,
      `${year}-12-31`,
    ];
  }


  /* =======================================================
     REFRESH CALENDAR
  ======================================================= */

  refreshCalendar(): void {

    const [
      from,
      to,
    ] =
      this.getFirstAndLastDayOfYear();

    this.resetDayAndHoursSelection();

    this.handleDatesService
      .getNotAvailableDatesAndHours(
        from,
        to,
        this.selectedStudentClassification,
        this.selectedMode,
        this.selectedCity,
      )
      .subscribe(
        data => {

          this.disabledDatesAndHours =
            data;

          this.generateCurrentMonthDays();
        },
      );
  }


  private resetDayAndHoursSelection():
    void {

    this.selectedDays = [];

    this.timeSlots =
      this.generateTimeSlots(
        8,
        20,
      );

    this.selectedDaysRestrictions =
      [];
  }


  /* =======================================================
     MONTH NAVIGATION
  ======================================================= */

  prevMonth(): void {

    const date =
      new Date(
        this.selectedYear,
        this.getMonthIndex(
          this.selectedMonth,
        ) - 1,
      );

    this.selectedMonth =
      date
        .toLocaleString(
          'es-ES',
          {
            month: 'long',
          },
        )
        .toUpperCase();

    this.selectedYear =
      date.getFullYear();

    this.selectedDays = [];

    this.getDisabledDates()
      .subscribe(
        () => {

          this.generateCurrentMonthDays();

          this.updateNavigationButtons();
        },
      );
  }


  nextMonth(): void {

    const date =
      new Date(
        this.selectedYear,
        this.getMonthIndex(
          this.selectedMonth,
        ) + 1,
      );

    this.selectedMonth =
      date
        .toLocaleString(
          'es-ES',
          {
            month: 'long',
          },
        )
        .toUpperCase();

    this.selectedYear =
      date.getFullYear();

    this.selectedDays = [];

    this.getDisabledDates()
      .subscribe(
        () => {

          this.generateCurrentMonthDays();

          this.updateNavigationButtons();
        },
      );
  }


  getMonthIndex(
    monthName: string,
  ): number {

    const monthMap:
      Record<string, number> = {

        ENERO: 0,
        FEBRERO: 1,
        MARZO: 2,
        ABRIL: 3,
        MAYO: 4,
        JUNIO: 5,
        JULIO: 6,
        AGOSTO: 7,
        SEPTIEMBRE: 8,
        OCTUBRE: 9,
        NOVIEMBRE: 10,
        DICIEMBRE: 11,
      };

    return (
      monthMap[
        monthName
      ] ?? -1
    );
  }


  updateNavigationButtons():
    void {

    const monthMap:
      Record<string, number> = {

        ENERO: 0,
        FEBRERO: 1,
        MARZO: 2,
        ABRIL: 3,
        MAYO: 4,
        JUNIO: 5,
        JULIO: 6,
        AGOSTO: 7,
        SEPTIEMBRE: 8,
        OCTUBRE: 9,
        NOVIEMBRE: 10,
        DICIEMBRE: 11,
      };

    const today =
      new Date();

    const currentMonthIndex =
      today.getMonth();

    const currentYear =
      today.getFullYear();

    const selectedMonthIndex =
      monthMap[
        this.selectedMonth
      ];

    const limitDate =
      new Date(
        currentYear + 1,
        currentMonthIndex - 1,
      );

    const selectedDate =
      new Date(
        this.selectedYear,
        selectedMonthIndex,
      );

    this.canGoBack =
      selectedDate >
      new Date(
        currentYear,
        currentMonthIndex,
      );

    this.canGoForward =
      selectedDate <
      limitDate;
  }


  /* =======================================================
     CURRENT MONTH
  ======================================================= */

  generateCurrentMonthDays():
    void {

    const monthMap:
      Record<string, number> = {

        ENERO: 0,
        FEBRERO: 1,
        MARZO: 2,
        ABRIL: 3,
        MAYO: 4,
        JUNIO: 5,
        JULIO: 6,
        AGOSTO: 7,
        SEPTIEMBRE: 8,
        OCTUBRE: 9,
        NOVIEMBRE: 10,
        DICIEMBRE: 11,
      };

    const monthIndex =
      monthMap[
        this.selectedMonth
      ];

    if (
      monthIndex === undefined
    ) {

      this.currentMonthDays =
        [];

      return;
    }

    const daysInMonth =
      new Date(
        this.selectedYear,
        monthIndex + 1,
        0,
      )
        .getDate();

    const firstDayOfWeek =
      new Date(
        this.selectedYear,
        monthIndex,
        1,
      )
        .getDay();

    this.currentMonthDays = [

      ...Array.from(
        {
          length:
            firstDayOfWeek,
        },

        () => ({
          day: '',
        }),
      ),

      ...Array.from(
        {
          length:
            daysInMonth,
        },

        (_, i) => {

          const day =
            i + 1;

          const isDisabled =
            this.disabledDatesAndHours[
              monthIndex.toString()
            ]
              ?.some(
                dateAndHour =>
                  dateAndHour.day ===
                    day &&
                  dateAndHour.hours
                    .length === 0,
              ) ??
            false;

          const isHoursDisabled =
            this.disabledDatesAndHours[
              monthIndex.toString()
            ]
              ?.some(
                dateAndHour =>
                  dateAndHour.day ===
                    day &&
                  dateAndHour.hours
                    .length > 0,
              ) ??
            false;

          return {
            day,
            isDisabled,
            isHoursDisabled,
          };
        },
      ),
    ];
  }


  /* =======================================================
     DAY SELECTION
  ======================================================= */

  selectDay(
    day: SelectedDay,
  ): void {

    if (!day.day) {
      return;
    }

    const index =
      this.selectedDays
        .findIndex(
          selected =>
            selected.day ===
            day.day,
        );

    if (index > -1) {

      this.selectedDays
        .splice(
          index,
          1,
        );

    } else {

      this.selectedDays
        .push({
          ...day,
          hours: [],
        });
    }


    if (
      this.selectedDays.length ===
      1
    ) {

      const remainingDay =
        this.selectedDays[0];

      if (
        this.isSunday(
          remainingDay.day,
        )
      ) {

        this.timeSlots =
          this.generateTimeSlots(
            8,
            20,
          );

      } else {

        this.recalculateTimeSlots(
          remainingDay,
        );
      }

    } else {

      this.timeSlots =
        this.generateTimeSlots(
          8,
          20,
        );
    }

    this.updateSelectedDaysRestrictions();
  }


  isDaySelected(
    day: any,
  ): boolean {

    return this.selectedDays
      .some(
        selected =>
          selected.day ===
          day.day,
      );
  }


  isSunday(
    dayNumber: number,
  ): boolean {

    return (
      new Date(
        this.selectedYear,
        this.getMonthIndex(
          this.selectedMonth,
        ),
        dayNumber,
      )
        .getDay() === 0
    );
  }


  /* =======================================================
     BLOCK DATE
  ======================================================= */

  blockDate(
    action:
      | 'enable'
      | 'disable',
  ): void {

    if (
      this.selectedDays.length ===
      0
    ) {
      return;
    }

    const monthMap:
      Record<string, number> = {

        ENERO: 0,
        FEBRERO: 1,
        MARZO: 2,
        ABRIL: 3,
        MAYO: 4,
        JUNIO: 5,
        JULIO: 6,
        AGOSTO: 7,
        SEPTIEMBRE: 8,
        OCTUBRE: 9,
        NOVIEMBRE: 10,
        DICIEMBRE: 11,
      };

    const monthIndex =
      monthMap[
        this.selectedMonth
      ];

    if (
      monthIndex === undefined
    ) {
      return;
    }

    const dates =
      this.selectedDays
        .map(
          ({
            day,
          }) =>
            `${this.selectedYear}-${(
              monthIndex + 1
            )
              .toString()
              .padStart(
                2,
                '0',
              )}-${day
              .toString()
              .padStart(
                2,
                '0',
              )}`,
        );

    const datesAndHours =
      this.selectedDays
        .map(
          selectedDay => ({

            date:
              `${this.selectedYear}-${(
                monthIndex + 1
              )
                .toString()
                .padStart(
                  2,
                  '0',
                )}-${selectedDay.day
                .toString()
                .padStart(
                  2,
                  '0',
                )}`,

            hours: [],

            ...(
              this.selectedStudentClassification &&
              {
                studentClassification:
                  this.selectedStudentClassification,
              }
            ),

            ...(
              this.selectedMode &&
              {
                mode:
                  this.selectedMode,
              }
            ),

            ...(
              this.selectedCity &&
              {
                city:
                  this.selectedCity,
              }
            ),
          }),
        );

    const uniqueDates =
      [
        ...new Set(
          dates,
        ),
      ];

    if (
      action === 'disable'
    ) {

      this.handleDatesService
        .disableDatesHours(
          datesAndHours,
        )
        .subscribe(
          () => {

            this.getDisabledDatesAndHours()
              .subscribe(
                () => {

                  this.generateCurrentMonthDays();

                  this.updateSelectedDaysRestrictions();
                },
              );
          },
        );
    }
  }


  /* =======================================================
     BLOCK HOURS
  ======================================================= */

  blockHours(): void {

    if (
      this.selectedDays.length ===
      0
    ) {
      return;
    }

    const monthMap:
      Record<string, number> = {

        ENERO: 0,
        FEBRERO: 1,
        MARZO: 2,
        ABRIL: 3,
        MAYO: 4,
        JUNIO: 5,
        JULIO: 6,
        AGOSTO: 7,
        SEPTIEMBRE: 8,
        OCTUBRE: 9,
        NOVIEMBRE: 10,
        DICIEMBRE: 11,
      };

    const monthIndex =
      monthMap[
        this.selectedMonth
      ];

    if (
      monthIndex === undefined
    ) {

      console.error(
        'Mes inválido:',
        this.selectedMonth,
      );

      return;
    }

    const hoursToDisable =
      this.selectedDays

        .filter(
          day =>
            day.hours.length >
            0,
        )

        .map(
          day => ({

            date:
              `${this.selectedYear}-${(
                monthIndex + 1
              )
                .toString()
                .padStart(
                  2,
                  '0',
                )}-${day.day
                .toString()
                .padStart(
                  2,
                  '0',
                )}`,

            hours:
              day.hours,

            ...(
              this.selectedStudentClassification &&
              {
                studentClassification:
                  this.selectedStudentClassification,
              }
            ),

            ...(
              this.selectedMode &&
              {
                mode:
                  this.selectedMode,
              }
            ),

            ...(
              this.selectedCity &&
              {
                city:
                  this.selectedCity,
              }
            ),
          }),
        );

    if (
      !hoursToDisable.length
    ) {
      return;
    }

    this.handleDatesService
      .disableDatesHours(
        hoursToDisable,
      )
      .subscribe({

        next: () => {

          this.afterRestrictionChange();

          const selectedDay =
            this.selectedDays[0];

          if (
            selectedDay
          ) {

            this.recalculateTimeSlots(
              selectedDay,
            );
          }

          this.updateSelectedDaysRestrictions();
        },

        error: err => {

          console.error(
            'Error al deshabilitar horas:',
            err,
          );
        },
      });
  }


  /* =======================================================
     TIME SLOTS
  ======================================================= */

  get isDaySelectedForHours():
    boolean {

    return (
      this.selectedDays.length ===
        1 &&
      this.timeSlots.length >
        0
    );
  }


  generateTimeSlots(
    startHour: number,
    endHour: number,
  ) {

    return Array.from(
      {
        length:
          endHour -
          startHour +
          1,
      },

      (_, i) => {

        const hour =
          startHour + i;

        return {
          label:
            `${hour}:00`,

          value:
            hour,
        };
      },
    );
  }


  recalculateTimeSlots(
    day: any,
  ): void {

    const monthMap:
      Record<string, number> = {

        ENERO: 0,
        FEBRERO: 1,
        MARZO: 2,
        ABRIL: 3,
        MAYO: 4,
        JUNIO: 5,
        JULIO: 6,
        AGOSTO: 7,
        SEPTIEMBRE: 8,
        OCTUBRE: 9,
        NOVIEMBRE: 10,
        DICIEMBRE: 11,
      };

    const monthIndex =
      monthMap[
        this.selectedMonth
      ];

    const selectedDate =
      new Date(
        this.selectedYear,
        monthIndex,
        day.day,
      );

    const dayOfWeek =
      selectedDate.getDay();

    const startHour =
      8;

    const endHour =
      20;

    const saturdayEndHour =
      14;

    const finalEndHour =
      dayOfWeek === 6
        ? saturdayEndHour
        : endHour;

    const disabledHours =
      this.getDisabledHoursForDay(
        day.day,
        monthIndex,
      );

    this.timeSlots =
      Array.from(
        {
          length:
            finalEndHour -
            startHour +
            1,
        },

        (_, i) => {

          const hour =
            startHour + i;

          return {
            label:
              `${hour}:00`,

            value:
              hour,

            isDisabled:
              disabledHours
                .includes(
                  hour,
                ),
          };
        },
      );
  }


  getDisabledHoursForDay(
    day: number,
    monthIndex: number,
  ): number[] {

    const monthData =
      this.disabledDatesAndHours[
        monthIndex.toString()
      ];

    if (
      !monthData
    ) {
      return [];
    }

    const dayEntries =
      monthData.filter(
        entry =>
          entry.day === day,
      );

    const mergedHours =
      dayEntries.flatMap(
        entry =>
          entry.hours,
      );

    return Array.from(
      new Set(
        mergedHours,
      ),
    );
  }


  /* =======================================================
     HOURS SELECTION
  ======================================================= */

  isHourSelected(
    hour: number,
  ): boolean {

    return (
      this.selectedDays.length >
        0 &&
      this.selectedDays[0]
        .hours
        .includes(
          hour,
        )
    );
  }


  toggleHourSelection(
    hour: number,
    isDisabled: boolean,
  ): void {

    if (
      this.selectedDays.length ===
      0
    ) {
      return;
    }

    const selectedDay =
      this.selectedDays[0];

    const index =
      selectedDay.hours
        .indexOf(
          hour,
        );

    if (
      index > -1
    ) {

      selectedDay.hours
        .splice(
          index,
          1,
        );

    } else {

      selectedDay.hours
        .push(
          hour,
        );
    }
  }


  private get selectedHours():
    number[] {

    return (
      this.selectedDays?.[0]
        ?.hours ??
      []
    );
  }


  private isHourDisabled(
    hour: number,
  ): boolean {

    const slot =
      this.timeSlots
        .find(
          time =>
            time.value ===
            hour,
        );

    return (
      !!slot?.isDisabled
    );
  }


  get hasSelectedDisabledHours():
    boolean {

    return this.selectedHours
      .some(
        hour =>
          this.isHourDisabled(
            hour,
          ),
      );
  }


  get hasSelectedEnabledHours():
    boolean {

    return this.selectedHours
      .some(
        hour =>
          !this.isHourDisabled(
            hour,
          ),
      );
  }


  /* =======================================================
     DAY STATE
  ======================================================= */

  hasDisabledSelectedDays():
    boolean {

    return this.selectedDays
      .some(
        day =>
          day.isDisabled,
      );
  }


  hasEnabledSelectedDays():
    boolean {

    return this.selectedDays
      .some(
        day =>
          !day.isDisabled,
      );
  }


  /* =======================================================
     REMOVE RESTRICTION
  ======================================================= */

  removeRestriction(
    day: number,
    entry: any,
  ): void {

    const monthIndex =
      this.getMonthIndex(
        this.selectedMonth,
      );

    if (
      monthIndex === -1
    ) {
      return;
    }

    const date =
      `${this.selectedYear}-${(
        monthIndex + 1
      )
        .toString()
        .padStart(
          2,
          '0',
        )}-${day
        .toString()
        .padStart(
          2,
          '0',
        )}`;

    const payload = {

      date,

      hours:
        entry.hours ?? [],

      ...(
        entry.studentClassification &&
        {
          studentClassification:
            entry.studentClassification,
        }
      ),

      ...(
        entry.mode &&
        {
          mode:
            entry.mode,
        }
      ),

      ...(
        entry.city &&
        {
          city:
            entry.city,
        }
      ),
    };


    /* =========================
       FULL DAY
    ========================= */

    if (
      !entry.hours ||
      entry.hours.length === 0
    ) {

      this.handleDatesService
        .enableDates([
          date,
        ])
        .subscribe(
          () => {

            this.afterRestrictionChange();
          },
        );

      return;
    }


    /* =========================
       SPECIFIC HOURS
    ========================= */

    this.handleDatesService
      .enableDatesHours([
        payload,
      ])
      .subscribe(
        () => {

          this.afterRestrictionChange();
        },
      );
  }


  /* =======================================================
     AFTER CHANGE
  ======================================================= */

  private afterRestrictionChange():
    void {

    this.getDisabledDatesAndHours()
      .subscribe(
        () => {

          if (
            this.selectedDays.length ===
            1
          ) {

            this.recalculateTimeSlots(
              this.selectedDays[0],
            );
          }

          this.generateCurrentMonthDays();

          this.updateSelectedDaysRestrictions();
        },
      );
  }


  /* =======================================================
     SELECTED DAY RESTRICTIONS
  ======================================================= */

  private updateSelectedDaysRestrictions():
    void {

    const monthIndex =
      this.getMonthIndex(
        this.selectedMonth,
      );

    const monthData =
      this.disabledDatesAndHours[
        monthIndex.toString()
      ] ?? [];

    this.selectedDaysRestrictions =
      this.selectedDays

        .filter(
          day =>
            !!day.day,
        )

        .map(
          selectedDay => {

            const entriesForDay =
              monthData

                .filter(
                  entry =>
                    entry.day ===
                    selectedDay.day,
                )

                .map(
                  entry => ({

                    hours:
                      entry.hours ??
                      [],

                    studentClassification:
                      entry
                        .studentClassification ??
                      null,

                    mode:
                      entry.mode ??
                      null,

                    city:
                      entry.city ??
                      null,
                  }),
                );

            return {

              day:
                selectedDay.day,

              month:
                this.selectedMonth,

              entries:
                entriesForDay,
            };
          },
        )

        .filter(
          item =>
            item.entries.length >
            0,
        );
  }


  /* =======================================================
     FORMAT
  ======================================================= */

  formatHours(
    hours: number[],
  ): string {

    if (
      !hours ||
      hours.length === 0
    ) {

      return (
        'Día completo deshabilitado'
      );
    }

    const sorted =
      [...hours]
        .sort(
          (a, b) =>
            a - b,
        );

    return sorted
      .map(
        hour =>
          `${hour}:00`,
      )
      .join(', ');
  }


  formatRestrictionLabel(
    studentClassification:
      string | null,

    mode:
      string | null,

    city:
      string | null,
  ): string {

    const student =
      studentClassification ??
      'TODOS';

    const meetingMode =
      mode ??
      'TODAS MODALIDADES';

    const location =
      city ??
      'TODAS CIUDADES';

    return (
      `${student} · ` +
      `${meetingMode} · ` +
      `${location}`
    );
  }


  /* =======================================================
     MODAL
  ======================================================= */

  confirmActionModal(
    message: string,
    onConfirm: () => void,
    title: string =
      'Confirmación',
  ): void {

    this.modal = {
      ...modalInitializer(),

      show: true,

      isInfo: true,

      showButtons: true,

      title,

      message,

      close:
        () =>
          this.closeModal(),

      confirm:
        () => {

          onConfirm();

          this.closeModal();
        },
    };
  }


  closeModal(): void {

    this.modal =
      modalInitializer();
  }


  openDeleteModal(
    day: number,
    entry: any,
  ): void {

    this.confirmActionModal(
      '¿Eliminar esta restricción?',

      () =>
        this.removeRestriction(
          day,
          entry,
        ),

      'Eliminar restricción',
    );
  }
}