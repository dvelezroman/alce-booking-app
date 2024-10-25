import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectIsLoggedIn, selectUserData } from '../../store/user.selector';
import { UserDto, UserRole } from '../../services/dtos/user.dto';
import { BookingService } from '../../services/booking.service';
import {MeetingDTO} from "../../services/dtos/booking.dto";
import { FormsModule } from '@angular/forms';
import { MeetingThemesService } from '../../services/meeting-themes.service';
import { MeetingThemeDto } from '../../services/dtos/meeting-theme.dto';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
      CommonModule,
      RouterModule,
      FormsModule,
      ModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  modal: ModalDto = modalInitializer();
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

  isModalOpen: boolean = false;
  selectedMeeting: any = null;
  meetingContent: string = '';
  isUpdating: boolean = false;

  constructor(private store: Store,
              private bookingService: BookingService,
              private meetingThemesService: MeetingThemesService
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
    this.selectedMonth = today.toLocaleString('es-ES', { month: 'long' });
    this.selectedYear = today.getFullYear();
    this.minMonth = this.selectedMonth;
    this.minYear = this.selectedYear;

    const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    this.maxMonth = nextMonthDate.toLocaleString('es-ES', { month: 'long' });
    this.maxYear = nextMonthDate.getFullYear();
  }

  generateCurrentMonthDays() {
    const monthIndex = new Date(Date.parse(this.selectedMonth + ' 1,' + this.selectedYear)).getMonth();
    const daysInMonth = new Date(this.selectedYear, monthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(this.selectedYear, monthIndex, 1).getDay();
  
    // Inicia con celdas vacías hasta que llegue el primer día del mes
    this.currentMonthDays = Array.from({ length: firstDayOfWeek }, () => ({ day: '', dayOfWeek: '', isNextMonth: false }));
  
    // Agrega los días del mes
    this.currentMonthDays = this.currentMonthDays.concat(
      Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(this.selectedYear, monthIndex, i + 1);
        const dayOfWeek = date.toLocaleString('default', { weekday: 'long' });
        return {
          day: i + 1,
          dayOfWeek,
          isNextMonth: false
        };
      })
    );
  
    // Agregar los días del próximo mes que completan la última semana
    const lastDayOfWeek = new Date(this.selectedYear, monthIndex, daysInMonth).getDay();
    if (lastDayOfWeek !== 6) {
      const daysToAdd = 6 - lastDayOfWeek;
      this.currentMonthDays = this.currentMonthDays.concat(
        Array.from({ length: daysToAdd }, (_, i) => ({
          day: i + 1,
          dayOfWeek: new Date(this.selectedYear, monthIndex + 1, i + 1).toLocaleString('default', { weekday: 'long' }),
          isNextMonth: true // Indicador para saber que pertenece al próximo mes
        }))
      );
    }
  }

  prevMonth() {
    const date = new Date(this.selectedYear, new Date(Date.parse(this.selectedMonth + " 1," + this.selectedYear)).getMonth(), 1);
    date.setMonth(date.getMonth() - 1);
    if (date < new Date(this.minYear, new Date(Date.parse(this.minMonth + " 1," + this.minYear)).getMonth())) return;
    this.selectedMonth = date.toLocaleString('default', { month: 'long' });
    this.selectedYear = date.getFullYear();
    this.selectedDay = null;
    this.generateCurrentMonthDays();
  }

  nextMonth() {
    const date = new Date(this.selectedYear, new Date(Date.parse(this.selectedMonth + " 1," + this.selectedYear)).getMonth(), 1);
    date.setMonth(date.getMonth() + 1);
    if (date > new Date(this.maxYear, new Date(Date.parse(this.maxMonth + " 1," + this.maxYear)).getMonth())) return;
    this.selectedMonth = date.toLocaleString('default', { month: 'long' });
    this.selectedYear = date.getFullYear();
    this.selectedDay = null;
    this.generateCurrentMonthDays();
  }

  isDaySelectable(day: { day: number | string, isNextMonth?: boolean }): boolean {
    if (typeof day.day !== 'number') return false;
  
    const today = new Date();
    const monthIndex = day.isNextMonth ? new Date().getMonth() + 1 : new Date(Date.parse(this.selectedMonth + ' 1,' + this.selectedYear)).getMonth();
    const dateToCheck = new Date(this.selectedYear, monthIndex, day.day);
    const dayDifference = Math.ceil((dateToCheck.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return dayDifference >= 0 && dateToCheck.getDay() !== 0; 
  }

  selectDay(day: { day: number | string, isNextMonth: boolean }) {
    if (typeof day.day === 'number') {
      this.selectedDay = day.day;
      if (day.isNextMonth) {
        this.nextMonth(); 
        this.selectedDay = day.day; 
      }
    }
  }

  showMeetingsOfDay(day: { day: number | string; dayOfWeek: string }) {
    if (typeof day.day === 'number') {
      this.selectedDate = new Date(this.selectedYear, new Date().getMonth(), day.day);
      const formattedDate = this.selectedDate.toISOString();
       //console.log('Día seleccionado (from y to):', formattedDate);
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

  openThemeModal(item: any) {
    this.selectedMeeting = {
      stageId: item.stageId,             
      instructorId: item.instructorId,   
      date: item.date,                   
      hour: item.hour,                   
      description: item.meetingTheme ? item.meetingTheme.description : '' 
    };
  
    this.meetingContent = this.selectedMeeting.description; 
    this.isUpdating = !!item.meetingTheme?.id; 
    this.isModalOpen = true;

    //console.log(this.selectedMeeting);
  }

  closeThemeModal(): void {
    this.isModalOpen = false; 
    this.meetingContent = ''; 
    this.isUpdating = false;
  }

  addMeetingTheme() {
    this.selectedMeeting.description = this.meetingContent;
    
    if (!this.selectedMeeting.description.trim()) {
      return;
    }
    this.meetingThemesService.create(this.selectedMeeting).subscribe({
      next: (response) => {
        this.showModal(this.createModalParams(false, 'Contenido de la clase agregado correctamente.'));
        this.closeThemeModal();  
      },
      error: (error) => {
        this.showModal(this.createModalParams(true, 'No se pudo agregar el contenido de la clase.'));
      }
    });
  }

  updateMeetingTheme() {
    if (!this.meetingContent.trim()) {
      return;
    }
  
    const updatedData: MeetingThemeDto = {
      ...this.selectedMeeting,
      description: this.meetingContent
    };
    console.log(updatedData);
  
    this.meetingThemesService.update(this.selectedMeeting.meetingThemeId, updatedData).subscribe({
      next: (response) => {
        this.showModal(this.createModalParams(false, 'Tema actualizado exitosamente.'));
        this.closeThemeModal();  
      },
      error: (error) => {
        this.showModal(this.createModalParams(true, 'Error al actualizar el tema.'));
      }
    });
  }

  showModal(params: ModalDto) {
    this.modal = { ...params };
    setTimeout(() => {
      this.modal.close();
    }, 2500);
  }

  closeModal = () => {
    this.modal = { ...modalInitializer() };
  }

  createModalParams(isError: boolean, message: string): ModalDto {
    return {
      ...this.modal,
      show: true,
      isError,
      isSuccess: !isError,
      message,
      close: this.closeModal
    };
  }


}
