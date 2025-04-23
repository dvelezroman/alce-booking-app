import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ProcessedEventDto, ProcessedEventFilterDto } from '../../services/dtos/process-event-filter.dto';
import { DateTime } from 'luxon';
import { ProcessedEventsService } from '../../services/processedEvents.service';
import { UsersService } from '../../services/users.service';
import { UserDto } from '../../services/dtos/user.dto';

@Component({
  selector: 'app-processed-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './processed-events.component.html',
  styleUrl: './processed-events.component.scss'
})
export class ProcessedEventsComponent implements OnInit {

  filter: ProcessedEventFilterDto = {
    processedById: undefined,
    from: '',
    to: '',
    eventType: '',
    sort: 'desc'
  };

  searchTerm: string = '';
  events: ProcessedEventDto[] = [];
  eventTypes: { key: string, label: string }[] = [];
  users: UserDto[] = [];
  filteredUsers: UserDto[] = [];
  showUserDropdown: boolean = false;
  formSubmitted: boolean = false;

  constructor(
    private processedEventService: ProcessedEventsService,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    this.initializeEventTypes();
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersService.searchUsers(0, undefined, undefined, undefined, undefined, undefined).subscribe({
      next: (result) => {
        this.users = result.users;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  filterUsers(): void {
    const query = this.searchTerm.trim().toLowerCase();
    if (query.length > 0) {
      this.filteredUsers = this.users.filter(user =>
        (`${user.firstName} ${user.lastName}`).toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
      this.showUserDropdown = true;
    } else {
      this.filteredUsers = [];
      this.showUserDropdown = false;
    }
  }

  hideDropdown(): void {
    setTimeout(() => {
      this.showUserDropdown = false;
    }, 200);
  }

  selectUser(user: UserDto): void {
    this.filter.processedById = user.id;
    this.searchTerm = `${user.firstName} ${user.lastName}`;
    this.showUserDropdown = false;
  }

  onFilterChange(): void {
    const hasAnyFilter = this.filter.eventType || this.filter.from || this.filter.to || this.filter.processedById;
    if (!hasAnyFilter) return;

    this.fetchEvents();
  }

  fetchEvents(): void {
    const filters: ProcessedEventFilterDto = { ...this.filter };
    this.processedEventService.getProcessedEvents(filters).subscribe(events => {
      this.events = events;
    });
  }

  formatDate(date: string): string {
    return DateTime.fromISO(date).setLocale('es').toFormat('DDDD HH:mm');
  }

  private initializeEventTypes(): void {
    this.eventTypes = [
      { key: 'CreateUser', label: 'Creación de Usuario' },
      { key: 'UpdateUser', label: 'Actualización de Usuario' },
      { key: 'DeleteUser', label: 'Eliminación de Usuario' },
      { key: 'AssignInstructor', label: 'Asignar Instructor' },
      { key: 'CreateLink', label: 'Creación de Link' },
      { key: 'DeleteLink', label: 'Eliminación de Link' },
      { key: 'Login', label: 'Inicio de Sesión' },
      { key: 'GenerateReport', label: 'Generar Reporte' },
      { key: 'MarkAssistance', label: 'Marcar Asistencia' },
      { key: 'UpdateLink', label: 'Actualizar Link' },
      { key: 'DisableDay', label: 'Deshabilitar Día' },
      { key: 'CreateMeet', label: 'Crear Reunión' },
      { key: 'DeleteMeet', label: 'Eliminar Reunión' },
      { key: 'CancelMeet', label: 'Cancelar Reunión' },
      { key: 'ClickMeet', label: 'Clic en Reunión' }
    ];
  }

  searchEvents(form: NgForm): void {
    this.formSubmitted = true;
    if (form.invalid) return;

    console.log('Datos enviados:', this.filter);

    const hasFilters =
      this.filter.from ||
      this.filter.to ||
      this.filter.processedById ||
      this.filter.eventType;

    if (!hasFilters) return;

    this.processedEventService.getProcessedEvents(this.filter).subscribe({
      next: (data) => {
        this.events = data;
        console.log('Eventos recibidos:', data);
      },
      error: (error) => {
        console.error('Error al obtener eventos:', error);
      }
    });
  }
}
