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
  currentMonthDays: { day: number | string; dayOfWeek: string; hasMeeting: boolean }[] = [];
  selectedDay: number | null = null;
  maxMonth!: string;
  maxYear!: number;
  minMonth!: string;
  minYear!: number;

  selectedDate: Date | null = null;
  meetingsOfDay: MeetingDTO[] = [];

  isModalOpen: boolean = false;
  selectedMeeting: any;
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
         const today = new Date();
         this.getInstructorMeetings(today);
      } else {
       // console.log('instructor ID no disponible');
      }
    });

    this.userData$.subscribe(user => {
      this.isInstructor = user?.role === UserRole.INSTRUCTOR;
      if (this.isInstructor) {
        console.log('Es un instructor:', user); 
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
    const monthMap: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };
  
    const monthIndex = monthMap[this.selectedMonth.toLowerCase()];
    if (monthIndex === undefined) {
      console.error('Mes inválido:', this.selectedMonth);
      return;
    }

    const daysInMonth = new Date(this.selectedYear, monthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(this.selectedYear, monthIndex, 1).getDay();
    
    this.currentMonthDays = Array.from({ length: firstDayOfWeek }, () => ({
      day: '',
      dayOfWeek: '',
      hasMeeting: false 
    }));
  
    // Días del mes actual
    this.currentMonthDays = this.currentMonthDays.concat(
      Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(this.selectedYear, monthIndex, i + 1);
        return {
          day: i + 1,
          dayOfWeek: date.toLocaleString('es-ES', { weekday: 'long' }),
          hasMeeting: false 
        };
      })
    );
  }

  nextMonth() {
    const monthMap: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };
  
    const currentMonthIndex = monthMap[this.selectedMonth.toLowerCase()];
    if (currentMonthIndex === undefined) {
      console.error('Mes inválido:', this.selectedMonth);
      return;
    }
  
    const newDate = new Date(this.selectedYear, currentMonthIndex + 1, 1);
    const maxDate = new Date(this.maxYear, monthMap[this.maxMonth.toLowerCase()], 1);
    if (newDate > maxDate) return;
  
    this.selectedMonth = newDate.toLocaleString('es-ES', { month: 'long' });
    this.selectedYear = newDate.getFullYear();
    this.selectedDay = null;
    this.generateCurrentMonthDays();
    this.getInstructorMeetings(newDate);
  }
  
  prevMonth() {
    const monthMap: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };
  
    const currentMonthIndex = monthMap[this.selectedMonth.toLowerCase()];
    if (currentMonthIndex === undefined) {
      console.error('Mes inválido:', this.selectedMonth);
      return;
    }
  
    const newDate = new Date(this.selectedYear, currentMonthIndex - 1, 1);
    const minDate = new Date(this.minYear, monthMap[this.minMonth.toLowerCase()], 1);
    if (newDate < minDate) return;
  
    this.selectedMonth = newDate.toLocaleString('es-ES', { month: 'long' });
    this.selectedYear = newDate.getFullYear();
    this.selectedDay = null;
    this.generateCurrentMonthDays();
    this.getInstructorMeetings(newDate);
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

  showMeetingsOfDay(day: { day: number | string; dayOfWeek: string; hasMeeting: boolean; meetings?: MeetingDTO[] }) {
    if (typeof day.day === 'number') {
      this.selectedDay = day.day;
      this.selectedDate = new Date(this.selectedYear, this.getMonthIndex(this.selectedMonth), day.day);
  
      if (day.hasMeeting && day.meetings && day.meetings.length > 0) {
        console.log(`Reuniones para el día ${this.selectedDate.toDateString()}:`, day.meetings);
  
        this.meetingsOfDay = day.meetings;
        console.log('Estructura de meetingsOfDay:', this.meetingsOfDay);
      } else {
        console.log(`No hay reuniones para el día ${this.selectedDate.toDateString()}.`);
        this.meetingsOfDay = [];
      }
    } else {
      console.log('Día no válido:', day);
    }
  }

  getMonthIndex(monthName: string): number {
    const monthMap: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };
  
    return monthMap[monthName.toLowerCase()] ?? -1; 
  }

  getInstructorMeetings(selectedDate: Date) {
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();
  
    this.bookingService.getInstructorMeetingsGroupedByHour({
      from: new Date(year, month, 1).toISOString(),
      to: new Date(year, month + 1, 0).toISOString(),
      instructorId: this.instructorId?.toString()
    }).subscribe({
      next: (meetings) => {
        const daysWithMeetings = new Map<number, MeetingDTO[]>(); // Mapa para reuniones por día
  
        meetings.forEach((meeting: MeetingDTO) => {
          const meetingDate = new Date(meeting.date);
          if (meetingDate.getMonth() === month && meetingDate.getFullYear() === year) {
            const day = meetingDate.getDate();
            if (!daysWithMeetings.has(day)) {
              daysWithMeetings.set(day, []);
            }
            daysWithMeetings.get(day)?.push(meeting); // Agregar la reunión al día correspondiente
          }
        });
  
        // Actualizar `currentMonthDays` con reuniones
        this.currentMonthDays = this.currentMonthDays.map(day => {
          if (typeof day.day === 'number' && daysWithMeetings.has(day.day)) {
            return {
              ...day,
              hasMeeting: true,
              meetings: daysWithMeetings.get(day.day) || [] // Asignar reuniones
            };
          }
          return { ...day, hasMeeting: false, meetings: [] }; // Día sin reuniones
        });
  
        console.log('Días actualizados con reuniones:', this.currentMonthDays);
      },
      error: (error) => console.error('Error al obtener reuniones:', error)
    });
  }

  openThemeModal(item: any) {
    this.selectedMeeting = {
      meetingThemeId: item.meetingThemeId,
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
    this.selectedMeeting = null;
    this.isUpdating = false;
  }

  addMeetingTheme() {
    this.selectedMeeting.description = this.meetingContent;

    if (!this.selectedMeeting.description.trim()) {
      return;
    }

    const createNewMeetingThemeData = {
      description: this.meetingContent,
      date: this.selectedMeeting.date,
      hour: this.selectedMeeting.hour,
      instructorId: this.selectedMeeting.instructorId,
      stageId: this.selectedMeeting.stageId,
    };

    this.meetingThemesService.create(createNewMeetingThemeData).subscribe({
      next: (response) => {
        this.showModal(this.createModalParams(false, 'Contenido de la clase agregado correctamente.'));
        this.closeThemeModal();
        if (this.selectedDate) {
          this.getInstructorMeetings(this.selectedDate);
        }
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
        stageId: this.selectedMeeting.stageId,
        instructorId: this.selectedMeeting.instructorId,
        date: this.selectedMeeting.date,
        hour: this.selectedMeeting.hour,
        description: this.meetingContent
    };

    this.meetingThemesService.update(this.selectedMeeting.meetingThemeId, updatedData).subscribe({
        next: (response) => {
            this.showModal(this.createModalParams(false, 'Tema actualizado exitosamente.'));
            this.closeThemeModal();
            if (this.selectedDate) {
                this.getInstructorMeetings(this.selectedDate); // Actualizamos reuniones solo del mes y año actuales
            }
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
