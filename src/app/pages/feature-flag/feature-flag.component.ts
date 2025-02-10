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
  selectedDay: number | null = null;
  canGoBack = false;
  canGoForward = true;

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
    this.generateCurrentMonthDays();
    this.updateNavigationButtons();
  }

  nextMonth() {
    const date = new Date(this.selectedYear, new Date(Date.parse(this.selectedMonth + " 1, " + this.selectedYear)).getMonth() + 1);
    this.selectedMonth = date.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    this.selectedYear = date.getFullYear();
    this.generateCurrentMonthDays();
    this.updateNavigationButtons();
  }

  generateCurrentMonthDays() {
    const monthIndex = new Date(Date.parse(this.selectedMonth + " 1, " + this.selectedYear)).getMonth();
    const daysInMonth = new Date(this.selectedYear, monthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(this.selectedYear, monthIndex, 1).getDay();

    this.currentMonthDays = Array.from({ length: firstDayOfWeek }, () => ({ day: '' }));
    this.currentMonthDays = this.currentMonthDays.concat(
      Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1 }))
    );
  }

  updateNavigationButtons() {
    const today = new Date();
    const currentMonth = today.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    const currentYear = today.getFullYear();
    const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const nextMonth = nextMonthDate.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    const nextYear = nextMonthDate.getFullYear();

    this.canGoBack = !(this.selectedMonth === currentMonth && this.selectedYear === currentYear);
    this.canGoForward = !(this.selectedMonth === nextMonth && this.selectedYear === nextYear);
  }

  selectDay(day: any) {
    if (day.day) {
      this.selectedDay = day.day;
    }
  }

  sendDate() {
    if (this.selectedDay) {
      console.log(`Fecha: ${this.selectedDay} ${this.selectedMonth} ${this.selectedYear}`);
    } else {
      console.log('No se ha seleccionado ninguna fecha.');
    }
  }
}
