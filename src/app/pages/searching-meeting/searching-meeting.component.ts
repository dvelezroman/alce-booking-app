import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { FilterMeetingsDto, MeetingDTO, UpdateMeetingLinkDto } from '../../services/dtos/booking.dto';
import { Stage, Student } from '../../services/dtos/student.dto';
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
  viewMode: 'table' | 'list' = 'table';
  isModalOpen = false;
  link: string = '';
  availableHours: number[] = [];
  meetings: MeetingDTO[] = [];
  originalMeetings: MeetingDTO[] = [];
  stages: Stage[] = [];
  studentsList: Student[] = [];

  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  isToastVisible: boolean = false;

  filter: FilterMeetingsDto = {
    from: '',
    to: '',
    hour: '',
    stageId: ''
  };


  constructor(private bookingService: BookingService,
              private stagesService: StagesService,
  ) {}

  ngOnInit(): void {
    const today = new Date();
    // this.filter.from = today.toISOString().split('T')[0];
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
      console.log(meetings);
    });
  }

  assignLink(): void {
    if (this.filter.hour && this.filter.from && this.link && this.filter.stageId) {
      const updateLinkParams: UpdateMeetingLinkDto = {
        date: this.filter.from,
        hour: +this.filter.hour,
        stageId: +this.filter.stageId,
        link: this.link
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

   // Método para mostrar el toast
   showToast(message: string, isSuccess: boolean): void {
    this.toastMessage = message;
    this.toastType = isSuccess ? 'success' : 'error';
    this.isToastVisible = true;

    setTimeout(() => {
      this.isToastVisible = false;
    }, 3000);
  }


}
