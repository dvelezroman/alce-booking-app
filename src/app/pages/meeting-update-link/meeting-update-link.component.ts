import { Component } from '@angular/core';
import {UpdateMeetingLinkDto} from "../../services/dtos/booking.dto";
import {BookingService} from "../../services/booking.service";
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-meeting-update-link',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './meeting-update-link.component.html',
  styleUrl: './meeting-update-link.component.scss'
})
export class MeetingUpdateLinkComponent {
  meetingData: UpdateMeetingLinkDto = {
    date: '',
    hour: null,
    link: '',
  };

  updateSuccess = false;
  updateError = false;

  constructor(private bookingService: BookingService) {}

  updateLink() {
    this.bookingService.updateMeetingLink(this.meetingData).subscribe(
      (response) => {
        this.updateSuccess = true;
        this.updateError = false;
        console.log('Meeting link updated successfully:', response);
      },
      (error) => {
        this.updateError = true;
        this.updateSuccess = false;
        console.error('Error updating meeting link:', error);
      }
    );
  }
}
