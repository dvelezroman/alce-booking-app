import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { FilterMeetingsDto, MeetingDTO, UpdateMeetingLinkDto } from '../../services/dtos/booking.dto';
import { Stage, Student } from '../../services/dtos/student.dto';
import { StudentsService } from '../../services/students.service';
import {StagesService} from "../../services/stages.service";

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
  originalMeetings: MeetingDTO[] = [];
  stages: Stage[] = [];
  studentsList: Student[] = [];

  filter: FilterMeetingsDto = {
    from: '',
    to: '',
    hour: '',
    stageId: ''
  };


  constructor(private bookingService: BookingService,
              private studentService: StudentsService,
              private stagesService: StagesService,
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.filter.from = today.toISOString().split('T')[0];
    this.availableHours = Array.from({ length: 13 }, (_, i) => 9 + i);
    this.stagesService.getAll().subscribe(response => {
      this.stages = response;
    })
  }


  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }


  onFilterChange(): void {
    this.bookingService.searchMeetings(this.filter).subscribe(meetings => {
      this.meetings = meetings;
      this.originalMeetings = meetings;
      console.log(meetings);
    });
  }

  filterByStage(): void {
    if (this.filter.stageId === '-1') {
      this.meetings = this.originalMeetings;
    } else {
      this.meetings = this.originalMeetings.filter(meeting => meeting.stageId === +this.filter.stageId!);
    }
  }

  assignLink(): void {
    if (this.filter.hour && this.filter.from && this.link) {
      const updateLinkParams: UpdateMeetingLinkDto = {
        date: this.filter.from,
        hour: +this.filter.hour,
        link: this.link
      };
      this.bookingService.updateMeetingLink(updateLinkParams).subscribe(
        response => {
          console.log('Link asignado correctamente', response);
          this.closeModal();
        },
        error => {
          console.error('Error al asignar el link', error);
        }
      );
    }
  }
}
