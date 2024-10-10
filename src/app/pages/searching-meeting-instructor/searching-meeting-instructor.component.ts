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
  selectedMeetingIds: any[] = [];
  isChecked: boolean = true;
  attendanceStatus: { [key: number]: boolean } = {};
  
  filter: FilterMeetingsDto = {
    from: '',
    to: '',
    hour: '',
    assigned: false,
  };
  constructor(private bookingService: BookingService,
               private store: Store) {}

  ngOnInit(): void {
    this.availableHours = Array.from({ length: 13 }, (_, i) => 9 + i);

    this.store.select(selectUserData).subscribe((userData: UserDto | null) => {
      if (userData && userData.instructor) {
        this.instructorId = userData.instructor.id;
        console.log('instructor ID:', this.instructorId); 
      } else {
        console.log('instructor ID no disponible');
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

  toggleSelection(meetingId: number | undefined) {
    if (meetingId !== undefined) {
        const selectedMeeting = this.meetings.find(meeting => meeting.id === meetingId);
        const studentName = `${selectedMeeting?.student?.user?.firstName || 'Estudiante'} ${selectedMeeting?.student?.user?.lastName || ''}`;

        this.attendanceStatus[meetingId] = !this.attendanceStatus[meetingId];
        
        const asistenciaTexto = this.attendanceStatus[meetingId] ? 'asistió' : 'no asistió';
        console.log(`${studentName} ${asistenciaTexto} a la clase ${meetingId}`);
    }
  }
}
