import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { NgModel } from '@angular/forms';
import { MeetingDTO } from '../../services/dtos/booking.dto';

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
 
  filter: { from: string, to: string, hour?: number } = {
    from: '',
    to: ''
  };

  meetings: MeetingDTO[] = [];

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    const today = new Date();
    this.filter.from = today.toISOString().split('T')[0];  
  }

  onHourChange(): void {
    const filterParams = {
      ...this.filter,
      hour: this.filter.hour?.toString() 
    };
  
    this.bookingService.searchMeetings(filterParams).subscribe(meetings => {
      this.meetings = meetings;
    });
  }

  onAssign(): void {
 
  }

}
