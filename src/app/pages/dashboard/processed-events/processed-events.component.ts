import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DateTime } from 'luxon';
import {debounceTime} from "rxjs/operators";
import {Subject} from "rxjs";
import { EnumLabelPipe } from '../../../pipes/enum-label.pipe';
import { ProcessedEventFilterDto, ProcessedEventDto, EventTypeE, EventUserDataI } from '../../../services/dtos/process-event-filter.dto';
import { UserDto } from '../../../services/dtos/user.dto';
import { ProcessedEventsService } from '../../../services/processedEvents.service';
import { UsersService } from '../../../services/users.service';
import { ModalComponent } from '../../../components/modal/modal.component';
import { modalInitializer } from '../../../components/modal/modal.dto';

@Component({
  selector: 'app-processed-events',
  standalone: true,
  imports: [CommonModule, FormsModule, EnumLabelPipe, ModalComponent],
  templateUrl: './processed-events.component.html',
  styleUrl: './processed-events.component.scss'
})
export class ProcessedEventsComponent implements OnInit {
  modal = modalInitializer();

  filter: ProcessedEventFilterDto = {
    processedById: undefined,
    from: undefined,
    to: undefined,
    eventType: undefined,
    sort: 'desc'
  };

  searchTerm: string = '';
  events: ProcessedEventDto[] = [];
  eventTypes: { key: string, label: string }[] = [];
  users: UserDto[] = [];
  filteredUsers: UserDto[] = [];
  showUserDropdown: boolean = false;
  formSubmitted: boolean = false;
  searchInput$ = new Subject<string>();
  showFromError = false;
  showToError = false;


  constructor(
    private processedEventService: ProcessedEventsService,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    this.searchInput$
      .pipe(debounceTime(500))
      .subscribe((term: string) => {
        this.filterUsers(term);
      });
    this.loadEventTypes();
  }

  private loadEventTypes() {
    this.eventTypes = Object.entries(EventTypeE).map(([key, label]) => ({
      key,
      label,
    }));
  }

  filterUsers(term: string): void {
    if (!term || term.trim().length < 2) {
      this.filteredUsers = [];
      this.showUserDropdown = false;
      return;
    }

    this.usersService.searchUsers(undefined, undefined, undefined, term, term, undefined).subscribe({
      next: (result) => {
        this.filteredUsers = result.users;
        this.showUserDropdown = true;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.filteredUsers = [];
        this.showUserDropdown = false;
      }
    });
  }

  selectUser(user: UserDto): void {
    this.searchTerm = `${user.firstName} ${user.lastName}`;
    this.filter.processedById = user.id;
    this.filteredUsers = [];
    this.showUserDropdown = false;
    this.filter.eventType = undefined;
  }

  formatDate(date: string): string {
    return DateTime.fromISO(date).setLocale('es').toFormat('DDDD HH:mm');
  }

  searchEvents(form: NgForm): void {
    this.formSubmitted = true;
    this.showFromError = false;
    this.showToError = false;

    if ((this.filter.from && !this.filter.to)) {
      this.showToError = true;
      return;
    }

    if ((this.filter.to && !this.filter.from)) {
      this.showFromError = true;
      return;
    }
    if (form.invalid) return;

    const hasFilters =
      this.filter.from ||
      this.filter.to ||
      this.filter.eventType ||
      this.filter.search;

    if (!hasFilters) return;

    this.processedEventService.getProcessedEvents(this.filter).subscribe({
      next: (data) => {
        this.events = data;
        // console.log('Filtro enviado:', this.filter);
        // console.log('Eventos recibidos:', data);
      },
      error: () => {
        // console.error('Error al obtener eventos:', error);
      }
    });
  }

  getUserFullName(user: EventUserDataI) {
    return user ? `${user.firstName}, ${user.lastName}` : 'Usuario no disponible';
  }

  hideDropdown(): void {
    setTimeout(() => {
      this.showUserDropdown = false;
    }, 200);
  }

  showMetadata(metadata: any): void {
    if (!metadata || metadata === 'null') {
      this.openMetadataModal('Sin Detalles', { mensaje: 'Este evento no tiene información adicional registrada.' });
      return;
    }

    this.openMetadataModal('Detalles del Evento', metadata);
  }

  openMetadataModal(title: string, metadata: any): void {
    let parsed;
    try {
      parsed = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
    } catch {
      parsed = { raw: metadata };
    }

    this.modal = {
      ...modalInitializer(),
      show: true,
      title,
      isMetadataViewer: true, 
      metadata: parsed,
      close: () => {
        this.modal.show = false;
      }
    };
  }

  // mapEventType(eventType: EventTypeE) {
  //   return EventTypeE[eventType as keyof typeof EventTypeE];
  // }
  protected readonly EventTypeE = EventTypeE;
}
