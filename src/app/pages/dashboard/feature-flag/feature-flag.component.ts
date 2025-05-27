import {Component, OnInit} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {catchError, EMPTY, Observable, switchMap, tap} from "rxjs";
import { FeatureFlagDto } from "../../../services/dtos/feature-flag.dto";
import { FeatureFlagService } from "../../../services/feature-flag.service";
import { HandleDatesService } from "../../../services/handle-dates.service";
import { SelectedDay, DisabledDays, DisabledDatesAndHours } from "../../../services/dtos/handle-date.dto";

@Component({
  selector: 'app-feature-flag',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './feature-flag.component.html',
  styleUrl: './feature-flag.component.scss'
})
export class FeatureFlagComponent implements OnInit {
  ffs: FeatureFlagDto[] = [];
  selectedMonth!: string;
  selectedYear!: number;
  currentMonthDays: any[] = [];
  selectedDays: SelectedDay[] = [];
  canGoBack = false;
  canGoForward = true;
  disabledDates: DisabledDays = {};
  disabledDatesAndHours: DisabledDatesAndHours = {};
  timeSlots: { label: string; value: number; isDisabled?: boolean }[] = [];

  constructor(
    private readonly ffService: FeatureFlagService,
    private readonly handleDatesService: HandleDatesService,
  ) {}

  ngOnInit() {
    this.getAll();

    this.getDisabledDates().subscribe(() => {
      this.generateCurrentMonthDays();
    });

    this.getDisabledDatesAndHours().subscribe(() => {
      const today = new Date();
      this.selectedMonth = today.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
      this.selectedYear = today.getFullYear();

      this.generateCurrentMonthDays();
      this.updateNavigationButtons();
    });
  }

  private getDisabledDates(): Observable<DisabledDatesAndHours> {
    const [firstDayOfYear, lastDayOfYear] = this.getFirstAndLastDayOfYear();
    return this.handleDatesService.getNotAvailableDatesAndHours(firstDayOfYear, lastDayOfYear).pipe(
      tap((disabledDatesAndHours) => {
        this.disabledDatesAndHours = disabledDatesAndHours
      })
    );
  }

  getFlagLabel(name: string): string {
    switch (name) {
      case 'enable-login': return 'Habilitar Login';
      case 'enable-schedule': return 'Habilitar Agendamiento';
      default: return name;
    }
  }

  private getDisabledDatesAndHours(): Observable<DisabledDatesAndHours> {
    const [firstDayOfYear, lastDayOfYear] = this.getFirstAndLastDayOfYear();

    return this.handleDatesService.getNotAvailableDatesAndHours(firstDayOfYear, lastDayOfYear).pipe(
      tap((disabledDatesAndHours) => {
        this.disabledDatesAndHours = disabledDatesAndHours;
        //console.log('fechas y horas deshabilitadas:', this.disabledDatesAndHours);
      })
    );
  }

  private getFirstAndLastDayOfYear(): [string, string] {
    const year = new Date().getFullYear();

    const firstDay = `${year}-01-01`;
    const lastDay = `${year}-12-31`;

    return [firstDay, lastDay];
  }

  private getAll() {
    this.ffService.getAll().subscribe(ffs => {
      console.log(ffs)
      const orden = ['enable-login', 'enable-schedule'];
      this.ffs = ffs.sort((a, b) => orden.indexOf(a.name) - orden.indexOf(b.name));
    });
  }

  toggle(ff: FeatureFlagDto) {
    this.ffService.toggle(ff.id).pipe(
      switchMap(async () => this.getAll()),
      catchError(() => {
        // Optional: Display user-friendly feedback using a notification service
        return EMPTY;
      })
    ).subscribe({
      next: () => console.log('Feature flag toggled and list updated'),
      error: (err) => console.error('Subscription error:', err)
    });
  }

  prevMonth() {
    const date = new Date(this.selectedYear, this.getMonthIndex(this.selectedMonth) - 1);
    this.selectedMonth = date.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    this.selectedYear = date.getFullYear();
    this.selectedDays = [];
    this.generateCurrentMonthDays();
    this.updateNavigationButtons();
  }

  nextMonth() {
    const date = new Date(this.selectedYear, this.getMonthIndex(this.selectedMonth) + 1);
    this.selectedMonth = date.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    this.selectedYear = date.getFullYear();
    this.selectedDays = [];
    this.generateCurrentMonthDays();
    this.updateNavigationButtons();
  }

  getMonthIndex(monthName: string): number {
    const monthMap: Record<string, number> = {
      ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
      JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11
    };
    return monthMap[monthName] ?? -1;
  }

  generateCurrentMonthDays() {
    const monthMap: Record<string, number> = {
      ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
      JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11
    };

    const monthIndex = monthMap[this.selectedMonth];
    if (monthIndex === undefined) {
      this.currentMonthDays = [];
      return;
    }

    const daysInMonth = new Date(this.selectedYear, monthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(this.selectedYear, monthIndex, 1).getDay();
    // 🔹 Generate days array with empty placeholders for first week offset
    this.currentMonthDays = [
      ...Array.from({ length: firstDayOfWeek }, () => ({ day: '' })),
      ...Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const isDisabled = this.disabledDatesAndHours[(monthIndex).toString()]?.some(dateAndHour => dateAndHour.day === day && dateAndHour.hours.length === 0) ?? false; // ✅ Corrected indexing
        const isHoursDisabled = this.disabledDatesAndHours[(monthIndex).toString()]?.some(dateAndHour => dateAndHour.day === day && dateAndHour.hours.length) ?? false; // ✅ Corrected indexing
        return { day, isDisabled, isHoursDisabled };
      })
    ];
  }

  updateNavigationButtons() {
    const monthMap: Record<string, number> = {
      ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
      JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11
    };

    const today = new Date();
    const currentMonthIndex = today.getMonth();
    const currentYear = today.getFullYear();
    const selectedMonthIndex = monthMap[this.selectedMonth];
    const limitDate = new Date(currentYear + 1, currentMonthIndex -1);
    const selectedDate = new Date(this.selectedYear, selectedMonthIndex);

    this.canGoBack = selectedDate > new Date(currentYear, currentMonthIndex);

    this.canGoForward = selectedDate < limitDate;
  }

  selectDay(day: SelectedDay) {
    if (!day.day) return;

    const index = this.selectedDays.findIndex(selected => selected.day === day.day);
    index > -1 ? this.selectedDays.splice(index, 1) : this.selectedDays.push({ ...day, hours: [] });

    if (this.selectedDays.length === 1) {
      const remainingDay = this.selectedDays[0];
      this.isSunday(remainingDay.day) ? this.timeSlots = [] : this.recalculateTimeSlots(remainingDay);
    } else {
      this.timeSlots = [];
    }
  }

  isDaySelected(day: any): boolean {
    return this.selectedDays.some(selected => selected.day === day.day);
  }

  blockDate(action: 'enable' | 'disable') {
    if (this.selectedDays.length > 0) {
      const monthMap: Record<string, number> = {
        ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
        JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11
      };

      const monthIndex = monthMap[this.selectedMonth];
      if (monthIndex === undefined) {
        return;
      }

      const dates = this.selectedDays.map(({ day }) =>
        `${this.selectedYear}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      );

      const datesAndHours = this.selectedDays.map((selectedDay) => ({
        date: `${this.selectedYear}-${(monthIndex + 1).toString().padStart(2, '0')}-${selectedDay.day.toString().padStart(2, '0')}`,
        hours: selectedDay.hours,
      }));

      const uniqueDates = [...new Set(dates)];
      if (action === 'disable') {
        this.handleDatesService.disableDatesHours(datesAndHours).subscribe(() => {
          this.getDisabledDates().subscribe(() => this.generateCurrentMonthDays());
        });
        // this.handleDatesService.disableDates(uniqueDates).subscribe(() => {
        //   this.getDisabledDates().subscribe(() => this.generateCurrentMonthDays());
        // });
      } else {
        this.handleDatesService.enableDates(uniqueDates).subscribe(() => {
          this.getDisabledDates().subscribe(() => this.generateCurrentMonthDays());
        });
      }

      this.selectedDays = [];
    }
  }

  blockHours() {
    if (this.selectedDays.length > 0) {
      const monthMap: Record<string, number> = {
        ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
        JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11
      };
  
      const monthIndex = monthMap[this.selectedMonth];
      if (monthIndex === undefined) {
        console.error('Mes inválido:', this.selectedMonth);
        return;
      }
  
      // Generar el payload para enviar las horas seleccionadas
      const hoursToDisable = this.selectedDays
        .filter(day => day.hours.length > 0)  
        .map(day => ({
          date: `${this.selectedYear}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.day.toString().padStart(2, '0')}`,
          hours: day.hours
        }));
  
        if (!hoursToDisable.length) {
          return;
        }
      
      this.handleDatesService.disableDatesHours(hoursToDisable).subscribe({
        next: () => {
          console.log('Horas deshabilitadas:', hoursToDisable);
          this.getDisabledDatesAndHours().subscribe(() => {
            const selectedDay = this.selectedDays[0]; 
            this.recalculateTimeSlots(selectedDay);
          });
        },
        error: (err) => {
          console.error('Error al deshabilitar horas:', err);
        }
      });
    } 
  }

  isSunday(dayNumber: number): boolean {
    return new Date(this.selectedYear, this.getMonthIndex(this.selectedMonth), dayNumber).getDay() === 0;
  }

  generateTimeSlots(startHour: number, endHour: number) {
    return Array.from({ length: endHour - startHour + 1 }, (_, i) => {
      const hour = startHour + i;
      return { label: `${hour}:00`, value: hour };
    });
  }

  recalculateTimeSlots(day: any) {
    const monthMap: Record<string, number> = {
      ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
      JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11
    };

    const monthIndex = monthMap[this.selectedMonth];
    const selectedDate = new Date(this.selectedYear, monthIndex, day.day);
    const dayOfWeek = selectedDate.getDay();
    const startHour = 8;
    const endHour = 20;
    const saturdayEndHour = 13;
    const finalEndHour = (dayOfWeek === 6) ? saturdayEndHour : endHour;
    const disabledHours = this.getDisabledHoursForDay(day.day, monthIndex);

    this.timeSlots = Array.from({ length: finalEndHour - startHour + 1 }, (_, i) => {
      const hour = startHour + i;
      return {
        label: `${hour}:00`,
        value: hour,
        isDisabled: disabledHours.includes(hour)
      };
    });
  }

  getDisabledHoursForDay(day: number, monthIndex: number): number[] {
    const monthData = this.disabledDatesAndHours[monthIndex.toString()];
    if (!monthData) return [];

    const dayData = monthData.find(d => d.day === day);
    return dayData ? dayData.hours : [];
  }

isHourSelected(hour: number): boolean {
  return this.selectedDays.length > 0 && this.selectedDays[0].hours.includes(hour);
}

toggleHourSelection(hour: number, isDisabled: boolean) {
  if (this.selectedDays.length === 0) return;

  const selectedDay = this.selectedDays[0];
  const index = selectedDay.hours.indexOf(hour);

  if (index > -1) {
    selectedDay.hours.splice(index, 1);  
  } else {
    selectedDay.hours.push(hour);       
  }
}


}
