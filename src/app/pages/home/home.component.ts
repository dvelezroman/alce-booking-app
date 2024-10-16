import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectIsLoggedIn, selectUserData } from '../../store/user.selector';
import { UserDto, UserRole } from '../../services/dtos/user.dto';
import { BookingService } from '../../services/booking.service';
import {MeetingDTO} from "../../services/dtos/booking.dto";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
      CommonModule,
      RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  isLoggedIn$: Observable<boolean>;
  isLoggedIn: boolean = false;
  userData$: Observable<UserDto | null>;
  isInstructor: boolean = false;
  instructorId: number | null = null;

  selectedMonth!: string;
  selectedYear!: number;
  currentMonthDays: { day: number | string; dayOfWeek: string }[] = [];
  selectedDay: number | null = null;
  maxMonth!: string;
  maxYear!: number;
  minMonth!: string;
  minYear!: number;

  selectedDate: Date | null = null;
  meetingsOfDay: { date: string, hour: number, instructorId: number, meetings: MeetingDTO[] }[] = [];

  constructor(private store: Store,
              private bookingService: BookingService
  ) {
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
    this.userData$ = this.store.select(selectUserData);
    this.initializeCalendarSettings();
  }

  ngOnInit() {
    this.isLoggedIn$.subscribe(state => {
      this.isLoggedIn = state;
    });

    this.store.select(selectUserData).subscribe((userData: UserDto | null) => {
      if (userData && userData.instructor) {
        this.instructorId = userData.instructor.id;
         //console.log('instructor ID:', this.instructorId);
      } else {
       // console.log('instructor ID no disponible');
      }
    });

    this.userData$.subscribe(user => {
      this.isInstructor = user?.role === UserRole.INSTRUCTOR;
      if (this.isInstructor) {
        this.generateCurrentMonthDays();
      }
    });
    
  }

  private initializeCalendarSettings(): void {
    const today = new Date();
    this.selectedMonth = today.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    this.selectedYear = today.getFullYear();
    this.minMonth = this.selectedMonth;
    this.minYear = this.selectedYear;

    const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    this.maxMonth = nextMonthDate.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    this.maxYear = nextMonthDate.getFullYear();
  }

   generateCurrentMonthDays() {
    const monthIndex = new Date(Date.parse(this.selectedMonth + ' 1,' + this.selectedYear)).getMonth();
    const daysInMonth = new Date(this.selectedYear, monthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(this.selectedYear, monthIndex, 1).getDay();

    this.currentMonthDays = Array.from({ length: firstDayOfWeek }, () => ({ day: '', dayOfWeek: '' }));
    this.currentMonthDays = this.currentMonthDays.concat(
      Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(this.selectedYear, monthIndex, i + 1);
        const dayOfWeek = date.toLocaleString('default', { weekday: 'long' });
        return {
          day: i + 1,
          dayOfWeek,
        };
      })
    );

    const lastDayOfWeek = new Date(this.selectedYear, monthIndex, daysInMonth).getDay();
    if (lastDayOfWeek !== 6) {
      const daysToAdd = 6 - lastDayOfWeek;
      this.currentMonthDays = this.currentMonthDays.concat(
        Array.from({ length: daysToAdd }, (_, i) => ({
          day: i + 1,
          dayOfWeek: '',
        }))
      );
    }
  }

  prevMonth() {
    if (this.selectedMonth === this.minMonth && this.selectedYear === this.minYear) return;

    const date = new Date(this.selectedYear, new Date(Date.parse(this.selectedMonth + " 1," + this.selectedYear)).getMonth() - 1, 1);
    this.selectedMonth = date.toLocaleString('default', { month: 'long' });
    this.selectedYear = date.getFullYear();
    this.selectedDay = null;
    this.generateCurrentMonthDays();
  }

  nextMonth() {
    if (this.selectedMonth === this.maxMonth && this.selectedYear === this.maxYear) return;

    const date = new Date(this.selectedYear, new Date(Date.parse(this.selectedMonth + " 1," + this.selectedYear)).getMonth() + 1, 1);
    this.selectedMonth = date.toLocaleString('default', { month: 'long' });
    this.selectedYear = date.getFullYear();
    this.selectedDay = null;
    this.generateCurrentMonthDays();
  }

  isDaySelectable(day: { day: number | string }): boolean {
    if (typeof day.day !== 'number') return false;

    const today = new Date();
    const dateToCheck = new Date(this.selectedYear, new Date(Date.parse(this.selectedMonth + ' 1,' + this.selectedYear)).getMonth(), day.day);
    const dayDifference = Math.ceil((dateToCheck.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return dayDifference >= 0 && dayDifference <= 7 && dateToCheck.getDay() !== 0;
  }

  selectDay(day: { day: number | string }) {
    if (typeof day.day === 'number') {
      this.selectedDay = day.day;
    }
  }

  showMeetingsOfDay(day: { day: number | string; dayOfWeek: string }) {
    if (typeof day.day === 'number') {
      this.selectedDate = new Date(this.selectedYear, new Date().getMonth(), day.day);
      const formattedDate = this.selectedDate.toISOString();
      // console.log('Día seleccionado (from y to):', formattedDate);
      // console.log('Instructor ID:', this.instructorId);

      this.bookingService.getInstructorMeetingsGroupedByHour({
        from: formattedDate,
        instructorId: this.instructorId?.toString()
      }).subscribe({
        next: (meetings) => {
          this.meetingsOfDay = meetings;
        },
        error: (error) => console.error('Error al obtener reuniones:', error)
      });
    }
  }


}
