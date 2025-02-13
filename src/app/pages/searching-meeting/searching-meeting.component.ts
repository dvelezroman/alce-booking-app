import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { FilterMeetingsDto, MeetingDTO, UpdateMeetingLinkDto } from '../../services/dtos/booking.dto';
import { Stage } from '../../services/dtos/student.dto';
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
  selectedInstructor: Instructor | null | undefined = null;
  instructorList: Instructor[] = [];
  selectedMeetingIds: any[] = [];
  ageGroupOptions: string[] = ['KIDS', 'TEENS', 'ADULTS'];
  mode: string[] =['ONLINE', 'PRESENCIAL'];

  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  isToastVisible: boolean = false;

  filter: FilterMeetingsDto = {
    from: '',
    to: '',
    hour: '',
    stageId: '',
    assigned: false,
    category: undefined,
    mode: undefined,
  };

  constructor(private bookingService: BookingService,
              private stagesService: StagesService,
              private instructorsService: InstructorsService,
  ) {}

  ngOnInit(): void {
    this.filter.category = undefined;
    // const today = new Date();
    // this.filter.from = today.toISOString().split('T')[0];
    this.availableHours = Array.from({ length: 13 }, (_, i) => 8 + i);
    this.stagesService.getAll().subscribe(response => {
      this.stages = response;
    })
    this.instructorsService.getAll().subscribe(response  => {
      this.instructorList = response;
    })
  }

  openModal(): void {
    this.selectedInstructor = null;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onFilterChange(): void {
    const filterParams: FilterMeetingsDto = {
      ...this.filter,
      hour: this.filter.hour ? this.filter.hour.toString() : undefined,
      assigned: this.filter.assigned ? true : undefined,
      category: this.filter.category ? this.filter.category : undefined,
      mode: this.filter.mode ? this.filter.mode : undefined,
    };
    if (this.filter.stageId === '') {
      delete filterParams.stageId;
    } else {
      filterParams.stageId = this.filter.stageId?.toString();
    }
    this.fetchMeetings(filterParams);
  }

  private fetchMeetings(params?: FilterMeetingsDto): void {
    this.bookingService.searchMeetings(params ? params : this.filter).subscribe(meetings => {
      if (this.filter.assigned) {
        this.meetings = meetings.filter(meeting => !!meeting.link);
      } else {
        this.meetings = meetings;
      }
      this.meetings.sort((a, b) => {
        const stageA = a.stage?.number ? parseFloat(a.stage.number.replace(/[^0-9.]/g, '')) : Infinity;
        const stageB = b.stage?.number ? parseFloat(b.stage.number.replace(/[^0-9.]/g, '')) : Infinity;
        return stageA - stageB;
      });
      this.originalMeetings = this.meetings;
      this.selectedMeetingIds = [];
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
    if (this.selectedInstructor && this.selectedInstructor.meetingLink?.link && this.selectedMeetingIds.length) {
      const updateLinkParams: UpdateMeetingLinkDto = {
        link: this.selectedInstructor.meetingLink?.link,
        instructorId: +this.selectedInstructor.id,
        meetingIds: this.selectedMeetingIds,
        password: this.selectedInstructor.meetingLink?.password,
      };
      this.bookingService.updateMeetingLink(updateLinkParams).subscribe({
        next: response => {
          //console.log('Link asignado correctamente', response);
          this.showToast('El link fue asignado', true);
          this.closeModal();
          this.selectedMeetingIds = [];
          this.fetchMeetings();
        },
        error: error => {
          console.error('Error al asignar el link', error);
          this.showToast('Error al asignar el link', false);
          this.fetchMeetings();
        },
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

  openCommentModal(comment: string): void {
    // Logic to open the modal
    alert(comment); // Replace with your modal service logic
  }
}
