import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { FilterMeetingsDto, MeetingDTO, UpdateMeetingLinkDto } from '../../services/dtos/booking.dto';
import { StagesService } from '../../services/stages.service';
import { Stage } from '../../services/dtos/student.dto';

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
  
  filter: FilterMeetingsDto = {
    from: '',
    to: '',
    hour: '9',  
    stageId: ''
  };


  constructor(private bookingService: BookingService,
              private stagesService: StagesService
  ) {}

  ngOnInit(): void {
    this.stagesService.getAll().subscribe(stages => {
      console.log(this.stages)
    });

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
    const filterParams: FilterMeetingsDto = {
      ...this.filter,
      hour: this.filter.hour?.toString(),
    };
    if (this.filter.stageId !== '-1') {
      filterParams.stageId = this.filter.stageId?.toString(); 
    }
    if (this.filter.from && this.filter.to) {
      this.bookingService.searchMeetings(filterParams).subscribe(meetings => {
        this.meetings = meetings;
        this.originalMeetings = meetings; 
  
        const uniqueStages = Array.from(new Set(meetings.map(meeting => meeting.stageId)))
          .map(stageId => ({
            id: stageId,
            number: stageId,
            description: `Stage ${stageId}`
          }));
  
        this.stages = [{ id: -1, number: -1, description: 'Todos los Stages' }, ...uniqueStages];
        console.log('Stages disponibles para el selector:', this.stages);
      });
    }
  }
  

  filterByStage(): void {
    if (this.filter.stageId === '-1') {
      this.meetings = this.originalMeetings;
    } else {
      this.meetings = this.originalMeetings.filter(meeting => meeting.stageId === +this.filter.stageId!);
    }
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
