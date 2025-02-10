import {Component, OnInit} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {FeatureFlagService} from "../../services/feature-flag.service";
import {FeatureFlagDto} from "../../services/dtos/feature-flag.dto";
import {catchError, EMPTY, switchMap} from "rxjs";

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
  selectedDay: { day: number, isDisabled: boolean } | null = null;
  canGoBack = false;
  canGoForward = true;
  buttonText: string = 'Selecciona un día';
  disabledDates: string[] = [];

  constructor(
    private readonly ffService: FeatureFlagService,
  ) {}

  ngOnInit() {
    this.getAll();
    const today = new Date();
      this.selectedMonth = today.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
      this.selectedYear = today.getFullYear();
      this.generateCurrentMonthDays();
      this.updateNavigationButtons();
  }

  private getAll() {
    this.ffService.getAll().subscribe(ffs => {
      this.ffs = ffs;
    });
  }

  toggle(ff: FeatureFlagDto) {
    this.ffService.toggle(ff.id).pipe(
      switchMap(async () => this.getAll()),
      catchError((error) => {
        console.error('Error toggling feature flag:', error);
        // Optional: Display user-friendly feedback using a notification service
        return EMPTY;
      })
    ).subscribe({
      next: () => console.log('Feature flag toggled and list updated'),
      error: (err) => console.error('Subscription error:', err)
    });
  }

  prevMonth() {
    const date = new Date(this.selectedYear, new Date(Date.parse(this.selectedMonth + " 1, " + this.selectedYear)).getMonth() - 1);
    this.selectedMonth = date.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    this.selectedYear = date.getFullYear();
    this.selectedDay = null;
    this.generateCurrentMonthDays();
    this.updateNavigationButtons();
  }

  nextMonth() {
    const date = new Date(this.selectedYear, new Date(Date.parse(this.selectedMonth + " 1, " + this.selectedYear)).getMonth() + 1);
    this.selectedMonth = date.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    this.selectedYear = date.getFullYear();
    this.selectedDay = null;
    this.generateCurrentMonthDays();
    this.updateNavigationButtons();
  }

  generateCurrentMonthDays() {
    const monthMap: Record<string, number> = {
      ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
      JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11
    };
  
    const monthIndex = monthMap[this.selectedMonth];
    if (monthIndex === undefined) {
      console.error(`Mes inválido: ${this.selectedMonth}`);
      this.currentMonthDays = [];
      return;
    }
  
    const daysInMonth = new Date(this.selectedYear, monthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(this.selectedYear, monthIndex, 1).getDay();
  
    this.currentMonthDays = Array.from({ length: firstDayOfWeek }, () => ({ day: '' }));
    this.currentMonthDays = this.currentMonthDays.concat(
      Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateString = `${this.selectedYear}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const isDisabled = this.disabledDates.includes(dateString);
  
        return { day, isDisabled };
      })
    );
  }

  updateNavigationButtons() {
    const monthMap: Record<string, number> = {
      ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
      JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11
    };
  
    const today = new Date();
    const currentMonthIndex = today.getMonth(); 
    const currentYear = today.getFullYear();
    const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const nextMonthIndex = nextMonthDate.getMonth();
    const nextYear = nextMonthDate.getFullYear();
    const selectedMonthIndex = monthMap[this.selectedMonth];
  
    this.canGoBack = !(selectedMonthIndex === currentMonthIndex && this.selectedYear === currentYear);
    this.canGoForward = !(selectedMonthIndex === nextMonthIndex && this.selectedYear === nextYear);
  }

  selectDay(day: any) {
    if (day.day) {
      this.selectedDay = { day: day.day, isDisabled: day.isDisabled };
      this.buttonText = day.isDisabled ? 'Habilitar Día' : 'Deshabilitar Día';
    }
  }

  blockDate() {
    if (this.selectedDay) {
      const { day } = this.selectedDay; 
  
      // Mapeo de meses para obtener el índice correcto del mes
      const monthMap: Record<string, number> = {
        ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
        JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11
      };
  
      const monthIndex = monthMap[this.selectedMonth];
  
      if (monthIndex === undefined) {
        console.error('Mes inválido:', this.selectedMonth);
        return;
      }
      const formattedDate = `${this.selectedYear}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      console.log(`Fecha seleccionada: ${formattedDate}`);
  
    } else {
      console.log('No se ha seleccionado ninguna fecha.');
    }
  }
}
