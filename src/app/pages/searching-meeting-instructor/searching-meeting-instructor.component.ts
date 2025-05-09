import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CreateMeetingDto, FilterMeetingsDto, MeetingDTO, UpdateMeetingLinkDto } from '../../services/dtos/booking.dto';
import { BookingService } from '../../services/booking.service';
import { Store } from '@ngrx/store';
import { UserDto } from '../../services/dtos/user.dto';
import { selectInstructorLink, selectUserData } from '../../store/user.selector';
import {Stage} from "../../services/dtos/student.dto";
import {StagesService} from "../../services/stages.service";
import { DateTime } from 'luxon';
import { CreateMeetingModalComponent } from '../../components/create-meeting/create-meeting-modal.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { TableComponent } from '../../shared/table/table.component';

@Component({
  selector: 'app-searching-meeting-instructor',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CreateMeetingModalComponent,
    ModalComponent,
    TableComponent
  ],
  templateUrl: './searching-meeting-instructor.component.html',
  styleUrl: './searching-meeting-instructor.component.scss'
})
export class SearchingMeetingInstructorComponent implements OnInit {
  availableHours: number[] = [];
  meetings: MeetingDTO[] = [];
  instructorId: number | null = null;
  modal: ModalDto = modalInitializer();
  stages: Stage[] = [];
  ageGroupOptions: string[] = ['KIDS', 'TEENS', 'ADULTS'];
  showCreateModal = false;
  instructorLink: string | null = null;

  filter: FilterMeetingsDto = {
    from: '',
    to: '',
    hour: '',
    assigned: true,
    category: undefined
  };

  tableColumns = ['stage', 'category', 'name', 'localdate', 'localhour', 'comment', 'linkOpened', 'present'];
  tableColumnLabels: Record<string, string> = {
    stage: 'Stage',
    category: 'Categoría',
    name: 'Nombre',
    localdate: 'Fecha',
    localhour: 'Hora',
    comment: 'Observación',
    linkOpened: 'Abrió Enlace',
    present: 'Marcar Asistencia',
  };
  
  constructor(
    private bookingService: BookingService,
    private stagesService: StagesService,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.filter.category = undefined;

    this.stagesService.getAll().subscribe(response => {
      this.stages = response;

    this.filter.stageId = '';
    })
    
    this.availableHours = Array.from({ length: 13 }, (_, i) => 8 + i);

    this.store.select(selectUserData).subscribe((userData: UserDto | null) => {
      if (userData && userData.instructor) {
        this.instructorId = userData.instructor.id;
        //console.log('instructor ID:', this.instructorId);
      } else {
       // console.log('instructor ID no disponible');
      }
    });
    this.store.select(selectInstructorLink).subscribe(link => {
      this.instructorLink = link;
      //console.log('Instructor link:', link);
    });
  }

  get formattedMeetings() {
  return this.meetings.map(meeting => ({
    source: meeting,
    stage: meeting.stage?.number || 'Stage no disponible',
    category: meeting.student?.studentClassification || 'Categoría no disponible',
    name: `${meeting.student?.user?.firstName || ''} ${meeting.student?.user?.lastName || ''}`.trim() || 'Nombre no disponible',
    localdate: meeting.localdate,
    localhour: `${meeting.localhour}:00`,
    comment: meeting.student?.user?.comment || 'Sin observación',
    linkOpened: this.hasMeetingPassed(meeting.localdate, meeting.localhour)
      ? (meeting.linkOpened ? '✔️' : '❌')
      : '-',
    present: meeting.present
  }));
}

  handleTableAction(event: { action: string; item: any }) {
    if (event.action === 'togglePresence') {
      this.toggleSelection(event.item.source);  
    }
  }

  isToday(date: Date | string): boolean {
    if (!date) return false;
  
    const today = DateTime.now().setZone('America/Guayaquil').startOf('day');
    const meetingDate = typeof date === 'string'
      ? DateTime.fromISO(date, { zone: 'America/Guayaquil' }).startOf('day')
      : DateTime.fromJSDate(date, { zone: 'America/Guayaquil' }).startOf('day');
  
    return today.toISODate() === meetingDate.toISODate();
  }

  disableCheckboxIfNotToday = (item: any) => !this.isToday(item.localdate);

  onFilterChange(): void {
    const filterParams: FilterMeetingsDto = {
      ...this.filter,
      hour: this.filter.hour ? this.filter.hour.toString() : undefined,
      category: this.filter.category ? this.filter.category : undefined
    };
    this.fetchMeetings(filterParams);
  }

  private fetchMeetings(params?: FilterMeetingsDto): void {
    const searchParams: FilterMeetingsDto = {
      ...params,
      instructorId: this.instructorId ? this.instructorId.toString() : undefined,
    };

    this.bookingService.searchMeetings(searchParams).subscribe(meetings => {
      this.meetings = meetings;
    });
  }

  toggleSelection(meeting: MeetingDTO) {
    if (meeting && meeting.id) {
      const updatedPresence = !meeting.present;
      this.bookingService.updateAssistance(meeting.id, !meeting.present).subscribe({
        next: () => {
            //console.log(`Asistencia actualizada para ${studentName}: ${asistenciaTexto}`);
          const filterParams: FilterMeetingsDto = {
            ...this.filter,
          };
          this.fetchMeetings(filterParams);
          const messageText = updatedPresence ? 'Presente' : 'Ausente';
          this.showModal(this.createModalParams(false, `Asistencia actualizada: ${messageText}`));
        },
        error: () => {
          //console.error(`Error al actualizar la asistencia de ${studentName}:`, error);
          this.showModal(this.createModalParams(true, 'Error al actualizar la asistencia'));
        }
      });
    }
  }

  hasMeetingPassed(localdate: string | Date, hour: number): boolean {
    if (!localdate || hour === undefined) return false;
  
    const meetingDateTime = DateTime.fromISO(String(localdate))
      .set({ hour, minute: 0 })
      .setZone('America/Guayaquil');
    const now = DateTime.now().setZone('America/Guayaquil');
  
    return now > meetingDateTime;
  }

  onCreateMeeting(): void {
    this.showCreateModal = true;
  }

  handleMeetingCreated(meeting: CreateMeetingDto): void {
    this.bookingService.bookMeeting(meeting).subscribe({
      next: (createdMeeting) => {
        this.showCreateModal = false;

        if (this.instructorLink && createdMeeting?.id && meeting.mode === 'ONLINE') {
          this.assignLinkIfNeeded(createdMeeting.id); 
        } else {
          this.showModal(this.createModalParams(false, 'Clase creada exitosamente.'));
          this.fetchMeetings(this.filter);
        }
      },
      error: (error) => {
        const msg = error?.error?.message || 'No se pudo crear la clase';
        this.showModal(this.createModalParams(true, msg));
        this.showCreateModal = false;
      }
    });
  }

  assignLinkIfNeeded(meetingId: number): void {
    const updateLinkData: UpdateMeetingLinkDto = {
      link: this.instructorLink!,
      meetingIds: [meetingId],
      instructorId: this.instructorId!
    };
  
    this.bookingService.updateMeetingLink(updateLinkData).subscribe({
      next: () => {
        this.fetchMeetings(this.filter);
        this.showModal(this.createModalParams(false, 'Clase creada exitosamente'));
      },
      error: () => {
        this.showModal(this.createModalParams(true, 'Clase creada, pero error al asignar link.'));
        this.fetchMeetings(this.filter);
      }
    });
  }

  showModal(params: ModalDto) {
    this.modal = { ...params };
    setTimeout(() => {
      this.modal.close();
    }, 3000);
  }

  closeModal = () => {
    this.modal = { ...modalInitializer() };
  }

  createModalParams(isError: boolean, message: string): ModalDto {
    return {
      ...this.modal,
      show: true,
      isError,
      isSuccess: !isError,
      message,
      close: this.closeModal
    };
  }
}

