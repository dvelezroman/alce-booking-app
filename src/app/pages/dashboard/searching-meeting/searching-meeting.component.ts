import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { BookingService } from '../../../services/booking.service';
import { MeetingDTO, FilterMeetingsDto, UpdateMeetingLinkDto } from '../../../services/dtos/booking.dto';
import { Instructor } from '../../../services/dtos/instructor.dto';
import { Stage } from '../../../services/dtos/student.dto';
import { InstructorsService } from '../../../services/instructors.service';
import { StagesService } from '../../../services/stages.service';

@Component({
  selector: 'app-searching-students-meeting',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ModalComponent
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
  modalConfig: ModalDto = modalInitializer();

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

  get totalSelectedMeetings(): number {
    return this.selectedMeetingIds.length;
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
    this.bookingService.searchMeetings(params ?? this.filter).subscribe(meetings => {
      this.meetings = meetings;
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
    const link = this.selectedInstructor?.meetingLink?.link?.trim();

    if (!this.selectedInstructor || !link) {
      this.showModalMessage('No se puede asignar este instructor porque no tiene enlace asignado.');
      return;
    }

    if (this.selectedMeetingIds.length) {
      const updateLinkParams: UpdateMeetingLinkDto = {
        link,
        instructorId: +this.selectedInstructor.id,
        meetingIds: this.selectedMeetingIds,
        password: this.selectedInstructor.meetingLink?.password,
      };
      this.bookingService.updateMeetingLink(updateLinkParams).subscribe({
        next: response => {
          //console.log('Link asignado correctamente', response);
          this.showModalMessage('El link fue asignado correctamente.', false, false, true);
          this.closeModal();
          this.selectedMeetingIds = [];
          this.fetchMeetings();
        },
        error: error => {
          //console.error('Error al asignar el link', error);
          this.showModalMessage('Error al asignar el link.', true);
          this.fetchMeetings();
        },
      });
    }
  }

  getStudentDisplayName(meeting: MeetingDTO): string {
    const first = meeting.student?.user?.firstName || '';
    const last = meeting.student?.user?.lastName || '';
    return (first + ' ' + last).trim() || 'Nombre no disponible';
  }

  isNewUser(meeting: MeetingDTO): boolean {
    return !!meeting.isNewUser;
  }

  getInstructorDisplayName(meeting: MeetingDTO): string {
    const first = meeting.instructor?.user?.firstName || '';
    const last = meeting.instructor?.user?.lastName || '';
    return (first + ' ' + last).trim() || 'No asignada';
  }


  //  showToast(message: string, isSuccess: boolean): void {
  //   this.toastMessage = message;
  //   this.toastType = isSuccess ? 'success' : 'error';
  //   this.isToastVisible = true;

  //   setTimeout(() => {
  //     this.isToastVisible = false;
  //   }, 3000);
  // }

  openCommentModal(comment: string): void {
    // Logic to open the modal
    alert(comment); // Replace with your modal service logic
  }

  showModalMessage(message: string, isError: boolean = true, isInfo: boolean = false, isSuccess: boolean = false) {
    this.modalConfig = {
      show: true,
      message,
      isError,
      isSuccess,
      isInfo,
      close: () => {
        this.modalConfig.show = false;
      }
    };

    // Auto cierre con delay
    setTimeout(() => {
      this.modalConfig.show = false;
    }, 3000);
  }
}
