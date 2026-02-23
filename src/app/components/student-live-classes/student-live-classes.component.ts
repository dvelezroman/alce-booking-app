import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { MeetingDTO, MeetingStatusEnum } from '../../services/dtos/booking.dto';
import { UserDto } from '../../services/dtos/user.dto';
import { selectUserData } from '../../store/user.selector';

@Component({
  selector: 'app-student-live-classes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-live-classes.component.html',
  styleUrls: ['./student-live-classes.component.scss']
})
export class StudentLiveClassesComponent implements OnInit {

  userData: UserDto | null = null;
  studentId: number | null = null;
  meetings: MeetingDTO[] = [];
  loading: boolean = false;

  filterMode: 'today' | 'all' = 'today';

  @Output() meetingsCount = new EventEmitter<number>();

  constructor(
    private bookingService: BookingService,
    private store: Store
  ) {}

  ngOnInit(): void {
  this.store.select(selectUserData).subscribe(user => {
    if (!user?.student?.id) return;

    this.studentId = user.student.id;
    this.userData = user;

    this.loadLiveClasses('all');
  });
}

  // ================================
  // Cargar TODAS las clases agendadas (no solo en vivo)
  // ================================
  loadLiveClasses(filter: 'today' | 'all' = 'today'): void {
  this.loading = true;
  this.filterMode = filter;

  const today = new Date();
  const toDate = new Date();
  toDate.setDate(today.getDate() + 15);

  const from = today.toISOString().split('T')[0];
  const to = toDate.toISOString().split('T')[0];

  this.bookingService.searchMeetings({
    from,
    to,
    hour: undefined,
    assigned: undefined,
    status: MeetingStatusEnum.ACTIVE,
    studentId: this.studentId ?? undefined
  }).subscribe({

    next: (meetings: MeetingDTO[]) => {
      this.meetings = this.applyFilter(meetings);
      this.meetingsCount.emit(this.meetings.length);
      this.loading = false;
    },

    error: (err) => {
      console.error('Error cargando clases:', err);
      this.loading = false;
    }
  });
}

  changeFilter(mode: 'today' | 'all') {
    this.filterMode = mode;
    this.loadLiveClasses(this.filterMode);
  }

  applyFilter(meetings: MeetingDTO[]): MeetingDTO[] {
    if (this.filterMode === 'all') return meetings;

    const today = new Date().toISOString().split('T')[0];

    return meetings.filter(m => {
      const d = new Date(m.date).toISOString().split('T')[0];
      return d === today;
    });
  }

  // ================================
  // Validar link disponible
  // ================================
  hasValidLink(meeting: MeetingDTO): boolean {
    const link = meeting.link?.trim();
    if (!link) return false;

    try {
      new URL(link.startsWith('http') ? link : `https://${link}`);
      return true;
    } catch (_) {
      return false;
    }
  }

  isValidUrl(link: string): boolean {
    try {
      new URL(link);
      return true;
    } catch (_) {
      return false;
    }
  }

  getFormattedLink(link: string | undefined): string {
    if (!link || !this.isValidUrl(link)) {
      return '';
    }
    return link.startsWith('http') ? link : `https://${link}`;
  }

  // ================================
  // Registrar asistencia
  // ================================
  handleMeetingAssistanceClick(meetingId?: number): void {
    if (!meetingId) return;

    this.bookingService.clickAssistanceByStudent(meetingId).subscribe({
      next: () => {
        console.log('Asistencia registrada');
      },
      error: () => {
        console.log('Error al registrar la asistencia');
      }
    });
  }

  // ================================
  // Entrar a clase
  // ================================
  enterClass(meeting: MeetingDTO): void {
    // No dejar entrar si NO está dentro del horario permitido
    if (!this.canEnter(meeting)) return;

    // No dejar entrar si el link está mal
    if (!this.hasValidLink(meeting)) return;

    // Registrar asistencia (mismo comportamiento que modal)
    if (meeting.id) {
      this.handleMeetingAssistanceClick(meeting.id);
    }

    const finalUrl = this.getFormattedLink(meeting.link);
    if (finalUrl) {
      window.open(finalUrl, '_blank');
    }
  }

  // ================================
  // Fecha: HOY / MAÑANA / 5 diciembre
  // ================================
  isToday(date: any): boolean {
    const today = new Date();
    const d = new Date(date);
    return d.toDateString() === today.toDateString();
  }

  isTomorrow(date: any): boolean {
    const today = new Date();
    const tomorrow = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
    const d = new Date(date);
    return d.toDateString() === tomorrow.toDateString();
  }

  formatDateTitle(date: any): string {
    if (this.isToday(date)) return 'Hoy';
    if (this.isTomorrow(date)) return 'Mañana';

    // Formato: "5 diciembre"
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long'
    });
  }

  canEnter(meeting: MeetingDTO): boolean {
    if (!meeting?.link?.trim()) return false;

    const LINK_ACTIVE_BEFORE = 5 * 60 * 1000;  // 5 min antes
    const LINK_ACTIVE_AFTER = 6 * 60 * 1000;  // 30 min después

    const localDateISO = new Date(meeting.localdate).toISOString().split('T')[0];
    const meetingStart = new Date(
      `${localDateISO}T${meeting.localhour.toString().padStart(2, '0')}:00`
    ).getTime();

    const now = Date.now();

    const start = meetingStart - LINK_ACTIVE_BEFORE;
    const end = meetingStart + LINK_ACTIVE_AFTER;

    return now >= start && now <= end;
  }
}