import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { FilterMeetingsDto, MeetingDTO, UpdateMeetingLinkDto } from '../../services/dtos/booking.dto';
import { Stage, Student } from '../../services/dtos/student.dto';
import {StagesService} from "../../services/stages.service";
import {Instructor} from "../../services/dtos/instructor.dto";
import {InstructorsService} from "../../services/instructors.service";

@Component({
  selector: 'app-searching-students-meeting',
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
  originalMeetings: MeetingDTO[] = [];
  stages: Stage[] = [];
  selectedInstructorId: number | undefined;
  instructorList: Instructor[] = [];
  selectedMeetingIds: any[] = [];

  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  isToastVisible: boolean = false;

  filter: FilterMeetingsDto = {
    from: '',
    to: '',
    hour: '',
    stageId: '',
    assigned: false,
  };

  constructor(private bookingService: BookingService,
              private stagesService: StagesService,
              private instructorsService: InstructorsService,
  ) {}

  ngOnInit(): void {
    // const today = new Date();
    // this.filter.from = today.toISOString().split('T')[0];
    this.availableHours = Array.from({ length: 13 }, (_, i) => 9 + i);
    this.stagesService.getAll().subscribe(response => {
      this.stages = response;
    })
    this.instructorsService.getAll().subscribe(response  => {
      this.instructorList = response;
    })
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }


  onFilterChange(): void {
    const filterParams: FilterMeetingsDto = {
      ...this.filter,
      hour: this.filter.hour ? this.filter.hour.toString() : undefined
    };
    if (this.filter.stageId === '') {
      delete filterParams.stageId;
    } else {
      filterParams.stageId = this.filter.stageId?.toString();
    }
    this.bookingService.searchMeetings(this.filter).subscribe(meetings => {
      this.meetings = meetings;
      this.originalMeetings = meetings;
    });
  }

  toggleSelection(meetingId: number | undefined) {
    if (this.selectedMeetingIds.includes(meetingId)) {
      // Remove the meeting Id from the selectedMeetings array
      this.selectedMeetingIds = this.selectedMeetingIds.filter(id => id !== meetingId);
    } else {
      // Add the meeting Id to the selectedMeetings array
      this.selectedMeetingIds.push(meetingId);
    }
  }

  assignLink(): void {
    if (this.selectedInstructorId && this.selectedMeetingIds.length) {
      const updateLinkParams: UpdateMeetingLinkDto = {
        link: this.link,
        instructorId: +this.selectedInstructorId,
        meetingIds: this.selectedMeetingIds,
      };
      this.bookingService.updateMeetingLink(updateLinkParams).subscribe({
        next: response => {
          console.log('Link asignado correctamente', response);
          this.showToast('El link fue asignado', true);
          this.closeModal();
        },
        error: error => {
          console.error('Error al asignar el link', error);
          this.showToast('Error al asignar el link', false);
        }
      });
    }
  }

   showToast(message: string, isSuccess: boolean): void {
    this.toastMessage = message;
    this.toastType = isSuccess ? 'success' : 'error';
    this.isToastVisible = true;

    setTimeout(() => {
      this.isToastVisible = false;
    }, 3000);
  }
}
