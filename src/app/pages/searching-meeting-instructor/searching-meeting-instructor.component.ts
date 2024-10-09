import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FilterMeetingsDto, MeetingDTO } from '../../services/dtos/booking.dto';
import { BookingService } from '../../services/booking.service';

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
  selectedMeetingIds: any[] = [];
  isChecked: boolean = true;
  attendanceStatus: { [key: number]: boolean } = {};
  
  filter: FilterMeetingsDto = {
    from: '',
    to: '',
    hour: '',
    assigned: false,
  };
  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.availableHours = Array.from({ length: 13 }, (_, i) => 9 + i);
  }

  onFilterChange(): void {
    const filterParams: FilterMeetingsDto = {
      ...this.filter,
      hour: this.filter.hour ? this.filter.hour.toString() : undefined
    };
    this.fetchMeetings(filterParams);
  }

  private fetchMeetings(params?: FilterMeetingsDto): void {
    this.bookingService.searchMeetings(params ? params : this.filter).subscribe(meetings => {
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
