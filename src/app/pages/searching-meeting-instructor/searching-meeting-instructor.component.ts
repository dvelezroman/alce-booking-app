import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FilterMeetingsDto, MeetingDTO } from '../../services/dtos/booking.dto';
import { BookingService } from '../../services/booking.service';
import { Store } from '@ngrx/store';
import { UserDto } from '../../services/dtos/user.dto';
import { selectUserData } from '../../store/user.selector';

@Component({
  selector: 'app-searching-meeting-instructor',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './searching-meeting-instructor.component.html',
  styleUrl: './searching-meeting-instructor.component.scss'
})
export class SearchingMeetingInstructorComponent implements OnInit {
  availableHours: number[] = [];
  meetings: MeetingDTO[] = [];
  instructorId: number | null = null;
  showSuccessToast: boolean = false;
  toastMessage: string = '';

  filter: FilterMeetingsDto = {
    from: '',
    to: '',
    hour: '',
    assigned: true,
  };
  constructor(private bookingService: BookingService,
               private store: Store) {}

  ngOnInit(): void {
    this.availableHours = Array.from({ length: 13 }, (_, i) => 9 + i);

    this.store.select(selectUserData).subscribe((userData: UserDto | null) => {
      if (userData && userData.instructor) {
        this.instructorId = userData.instructor.id;
        //console.log('instructor ID:', this.instructorId);
      } else {
       // console.log('instructor ID no disponible');
      }
    });
  }

  onFilterChange(): void {
    const filterParams: FilterMeetingsDto = {
      ...this.filter,
      hour: this.filter.hour ? this.filter.hour.toString() : undefined
    };
    this.fetchMeetings(filterParams);
  }

  private fetchMeetings(params?: FilterMeetingsDto): void {
    const searchParams: FilterMeetingsDto = {
      ...params,
      instructorId: this.instructorId ? this.instructorId.toString() : undefined,
    };

    this.bookingService.searchMeetings(searchParams).subscribe(meetings => {
      this.meetings = meetings;
    });
  }

  toggleSelection(meeting: MeetingDTO) {
    if (meeting && meeting.id) {
      const updatedPresence = !meeting.present;
      this.bookingService.updateAssistance(meeting.id, !meeting.present).subscribe({
        next: () => {
            //console.log(`Asistencia actualizada para ${studentName}: ${asistenciaTexto}`);
          const filterParams: FilterMeetingsDto = {
            ...this.filter,
          };
          this.fetchMeetings(filterParams);
          const messageText = updatedPresence ? 'Presente' : 'Ausente';
          this.toastMessage = `Asistencia actualizada: ${messageText}`;
          this.showSuccessToast = true;

          // Hide the toast after 3 seconds
          setTimeout(() => {
            this.showSuccessToast = false;
          }, 3000);
        },
        error: () => {
          //console.error(`Error al actualizar la asistencia de ${studentName}:`, error);
          this.toastMessage = 'Error al actualizar la asistencia';
          this.showSuccessToast = true;

          setTimeout(() => {
            this.showSuccessToast = false;
          }, 3000);
        }
      });
    }
  }

  closeToast() {
    this.showSuccessToast = false;
  }
}
