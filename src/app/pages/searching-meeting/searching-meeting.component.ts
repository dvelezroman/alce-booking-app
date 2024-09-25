import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { NgModel } from '@angular/forms';
import { MeetingDTO, UpdateMeetingLinkDto } from '../../services/dtos/booking.dto';

@Component({
  selector: 'app-searching-meeting',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './searching-meeting.component.html',
  styleUrl: './searching-meeting.component.scss'
})
export class SearchingMeetingComponent implements OnInit {
  isModalOpen = false;
  link: string = ''; 
  availableHours: number[] = [];
  meetings: MeetingDTO[] = [];
  
  filter: { from: string, to: string, hour?: number } = {
    from: '',
    to: '',
     hour: 9
  };
  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    const today = new Date();
    this.filter.from = today.toISOString().split('T')[0];  

    this.availableHours = Array.from({ length: 13 }, (_, i) => 9 + i);
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }


  onFilterChange(): void {
    const filterParams = {
      ...this.filter,
      hour: this.filter.hour?.toString() 
    };
  
    this.bookingService.searchMeetings(filterParams).subscribe(meetings => {
      this.meetings = meetings;
    });
  }

  assignLink(): void {
    this.meetings.forEach(meeting => {
      const updateData: UpdateMeetingLinkDto = {
        date: new Date(meeting.date).toISOString(), 
        hour: meeting.hour,
        link: this.link  
      };
  
      this.bookingService.updateMeetingLink(updateData).subscribe(
        response => {
          console.log('Link asignado correctamente', response);
          this.closeModal();  
        },
        error => {
          console.error('Error al asignar el link', error);
        }
      );
    });
  }

}
