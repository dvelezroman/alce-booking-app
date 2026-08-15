import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { DateTime } from 'luxon';

import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { EnumLabelPipe } from '../../../pipes/enum-label.pipe';

import {
  EventTypeE,
  EventUserDataI,
  ProcessedEventDto,
  ProcessedEventFilterDto,
} from '../../../services/dtos/process-event-filter.dto';

import { UserDto } from '../../../services/dtos/user.dto';

import { ProcessedEventsService } from '../../../services/processedEvents.service';
import { UsersService } from '../../../services/users.service';

import { ModalComponent } from '../../../components/modal/modal.component';
import { modalInitializer } from '../../../components/modal/modal.dto';

/* =========================
   CHILD COMPONENTS
========================= */

import { EventsHeaderComponent } from '../../../components/events/events-header/events-header.component';
import { EventsFiltersComponent } from '../../../components/events/events-filters/events-filters.component';
import { EventsSummaryComponent } from '../../../components/events/events-summary/events-summary.component';
import { EventsTableComponent } from '../../../components/events/events-table/events-table.component';
import { EventsPaginationComponent } from '../../../components/events/events-pagination/events-pagination.component';

@Component({
  selector: 'app-processed-events',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EnumLabelPipe,
    ModalComponent,

    EventsHeaderComponent,
    EventsFiltersComponent,
    EventsSummaryComponent,
    EventsTableComponent,
    EventsPaginationComponent,
  ],
  templateUrl: './processed-events.component.html',
  styleUrl: './processed-events.component.scss',
})
export class ProcessedEventsComponent implements OnInit {

  /* =========================
     MODAL
  ========================= */

  modal = modalInitializer();


  /* =========================
     FILTER
  ========================= */

  filter: ProcessedEventFilterDto = {
    processedById: undefined,
    from: undefined,
    to: undefined,
    eventType: undefined,
    sort: 'desc',
  };


  /* =========================
     DATA
  ========================= */

  searchTerm: string = '';

  events: ProcessedEventDto[] = [];

  eventTypes: {
    key: string;
    label: string;
  }[] = [];

  users: UserDto[] = [];

  filteredUsers: UserDto[] = [];


  /* =========================
     UI STATE
  ========================= */

  showUserDropdown: boolean = false;

  formSubmitted: boolean = false;

  showFromError = false;

  showToError = false;

  loading = false;

  searchAttempted = false;


  /* =========================
     SEARCH
  ========================= */

  searchInput$ = new Subject<string>();


  /* =========================
     PAGINATION
  ========================= */

  currentPage = 1;

  itemsPerPage = 10;

  readonly itemsPerPageOptions = [
    10,
    25,
    50,
    100,
  ];


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private processedEventService: ProcessedEventsService,
    private usersService: UsersService,
  ) {}


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.searchInput$
      .pipe(
        debounceTime(500),
      )
      .subscribe((term: string) => {
        this.filterUsers(term);
      });

    this.loadEventTypes();
  }


  /* =========================
     EVENT TYPES
  ========================= */

  private loadEventTypes(): void {
    this.eventTypes = Object
      .entries(EventTypeE)
      .map(([key, label]) => ({
        key,
        label,
      }));
  }


  /* =========================
     USER INPUT
  ========================= */

  onUserInputChange(term: string): void {
    this.searchTerm = term;

    /*
     * Si el usuario modifica manualmente el texto después de haber
     * seleccionado una persona, quitamos el ID seleccionado.
     */
    if (this.filter.processedById) {
      this.filter.processedById = undefined;
    }

    this.searchInput$.next(term);
  }


  /* =========================
     FILTER USERS
  ========================= */

  filterUsers(term: string): void {
    if (
      !term ||
      term.trim().length < 2
    ) {
      this.filteredUsers = [];
      this.showUserDropdown = false;

      return;
    }

    this.usersService
      .searchUsers(
        undefined,
        undefined,
        undefined,
        term,
        term,
        undefined,
      )
      .subscribe({
        next: (result) => {
          this.filteredUsers = result.users;

          this.showUserDropdown =
            this.filteredUsers.length > 0;
        },

        error: (error) => {
          console.error(
            'Error al cargar usuarios:',
            error,
          );

          this.filteredUsers = [];
          this.showUserDropdown = false;
        },
      });
  }


  /* =========================
     SELECT USER
  ========================= */

  selectUser(user: UserDto): void {
    this.searchTerm =
      `${user.firstName} ${user.lastName}`;

    this.filter.processedById =
      user.id;

    this.filteredUsers = [];

    this.showUserDropdown = false;

    this.filter.eventType =
      undefined;
  }


  /* =========================
     HIDE DROPDOWN
  ========================= */

  hideDropdown(): void {
    setTimeout(() => {
      this.showUserDropdown = false;
    }, 200);
  }


  /* =========================
     DATE FORMAT
  ========================= */

  formatDate(date: string): string {
    return DateTime
      .fromISO(date)
      .setLocale('es')
      .toFormat('DDDD HH:mm');
  }


  /* =========================
     SEARCH EVENTS
  ========================= */

  searchEvents(form?: NgForm): void {
    this.formSubmitted = true;

    this.showFromError = false;
    this.showToError = false;

    if (
      this.filter.from &&
      !this.filter.to
    ) {
      this.showToError = true;
      return;
    }

    if (
      this.filter.to &&
      !this.filter.from
    ) {
      this.showFromError = true;
      return;
    }

    if (
      form &&
      form.invalid
    ) {
      return;
    }

    const hasFilters =
      this.filter.from ||
      this.filter.to ||
      this.filter.eventType ||
      this.filter.search ||
      this.filter.processedById;

    if (!hasFilters) {
      return;
    }

    this.currentPage = 1;

    this.loading = true;

    this.searchAttempted = true;

    this.processedEventService
      .getProcessedEvents(
        this.filter,
      )
      .subscribe({
        next: (data) => {
          this.events = data;

          this.loading = false;

          // console.log('Filtro enviado:', this.filter);
          // console.log('Eventos recibidos:', data);
        },

        error: () => {
          this.loading = false;

          // console.error('Error al obtener eventos:', error);
        },
      });
  }


  /* =========================
     CHILD SEARCH
  ========================= */

  onSearchRequested(): void {
    this.searchEvents();
  }


  /* =========================
     FILTER CHANGES
  ========================= */

  onEventTypeChange(
    eventType: EventTypeE | undefined,
  ): void {
    this.filter.eventType = eventType;
  }


  onFromChange(
    value: string | undefined,
  ): void {
    this.filter.from =
      value || undefined;

    this.showFromError = false;
  }


  onToChange(
    value: string | undefined,
  ): void {
    this.filter.to =
      value || undefined;

    this.showToError = false;
  }


  onSortChange(
    sort: 'asc' | 'desc',
  ): void {
    this.filter.sort = sort;
  }


  onDescriptionSearchChange(
    value: string,
  ): void {
    this.filter.search =
      value?.trim() ||
      undefined;
  }


  /* =========================
     CLEAR FILTERS
  ========================= */

  clearFilters(): void {
    this.filter = {
      processedById: undefined,
      from: undefined,
      to: undefined,
      eventType: undefined,
      sort: 'desc',
      search: undefined,
    };

    this.searchTerm = '';

    this.filteredUsers = [];

    this.showUserDropdown = false;

    this.formSubmitted = false;

    this.showFromError = false;

    this.showToError = false;

    this.currentPage = 1;
  }


  /* =========================
     USER NAME
  ========================= */

  getUserFullName(
    user: EventUserDataI,
  ): string {
    return user
      ? `${user.firstName}, ${user.lastName}`
      : 'Usuario no disponible';
  }


  /* =========================
     PAGINATED EVENTS
  ========================= */

  get paginatedEvents(): ProcessedEventDto[] {
    const start =
      (this.currentPage - 1) *
      this.itemsPerPage;

    const end =
      start +
      this.itemsPerPage;

    return this.events.slice(
      start,
      end,
    );
  }


  /* =========================
     TOTAL PAGES
  ========================= */

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(
        this.events.length /
        this.itemsPerPage,
      ),
    );
  }


  /* =========================
     PAGINATION RANGE
  ========================= */

  get paginationFrom(): number {
    if (
      this.events.length === 0
    ) {
      return 0;
    }

    return (
      (this.currentPage - 1) *
      this.itemsPerPage
    ) + 1;
  }


  get paginationTo(): number {
    if (
      this.events.length === 0
    ) {
      return 0;
    }

    return Math.min(
      this.currentPage *
      this.itemsPerPage,
      this.events.length,
    );
  }


  get paginationLabel(): string {
    if (
      this.events.length === 0
    ) {
      return '0 eventos';
    }

    return (
      `Mostrando ${this.paginationFrom} ` +
      `a ${this.paginationTo} ` +
      `de ${this.events.length} eventos`
    );
  }


  /* =========================
     PAGE STATE
  ========================= */

  get canPreviousPage(): boolean {
    return this.currentPage > 1;
  }


  get canNextPage(): boolean {
    return (
      this.currentPage <
      this.totalPages
    );
  }


  /* =========================
     CHANGE PAGE
  ========================= */

  changePage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.currentPage = page;
  }


  previousPage(): void {
    if (
      !this.canPreviousPage
    ) {
      return;
    }

    this.currentPage--;
  }


  nextPage(): void {
    if (
      !this.canNextPage
    ) {
      return;
    }

    this.currentPage++;
  }


  /* =========================
     PAGE SIZE
  ========================= */

  changeItemsPerPage(
    value: number,
  ): void {
    const size =
      Number(value);

    if (
      !Number.isFinite(size) ||
      size <= 0
    ) {
      return;
    }

    this.itemsPerPage = size;

    this.currentPage = 1;
  }


  /* =========================
    SUMMARY
  ========================= */

  get totalEvents(): number {
    return this.events.length;
  }


  /* =========================
    EVENT TYPE RAW
  ========================= */

  private getRawEventType(
    event: ProcessedEventDto,
  ): string {
    return String(
      event.eventType || '',
    ).trim();
  }


  /* =========================
    LOGIN EVENTS
  ========================= */

  get loginEventsCount(): number {
    return this.events.filter(
      event =>
        this.getRawEventType(event) ===
        'Login',
    ).length;
  }


  /* =========================
    USER EVENTS
  ========================= */

  get userEventsCount(): number {
    const userEvents =
      new Set<string>([
        'CreateUser',
        'UpdateUser',
        'DeleteUser',
        'DisableUser',
      ]);

    return this.events.filter(
      event =>
        userEvents.has(
          this.getRawEventType(event),
        ),
    ).length;
  }


  /* =========================
    CONTENT EVENTS
  ========================= */

  get contentEventsCount(): number {
    const contentEvents =
      new Set<string>([
        'CreateStudyContent',
        'UpdateStudyContent',
        'DisableStudyContent',
        'DeleteStudyContent',
        'AssignStudyContent',

        'StudyContentCreated',
        'StudyContentUpdated',
        'StudyContentDeleted',

        'ResourceCreated',
        'ResourceEdited',
        'ResourceDeleted',
      ]);

    return this.events.filter(
      event =>
        contentEvents.has(
          this.getRawEventType(event),
        ),
    ).length;
  }


  /* =========================
    MEETING EVENTS
  ========================= */

  get meetingEventsCount(): number {
    const meetingEvents =
      new Set<string>([
        'CreateMeet',
        'DeleteMeet',
        'CancelMeet',
        'ClickMeet',
        'CreateMeetByInstructor',
        'AssignInstructor',
      ]);

    return this.events.filter(
      event =>
        meetingEvents.has(
          this.getRawEventType(event),
        ),
    ).length;
  }


  /* =========================
    OTHER EVENTS
  ========================= */

  get otherEventsCount(): number {
    return Math.max(
      0,
      this.totalEvents -
      this.loginEventsCount -
      this.userEventsCount -
      this.contentEventsCount -
      this.meetingEventsCount,
    );
  }


  /* =========================
    PERCENTAGES
  ========================= */

  getEventPercentage(
    count: number,
  ): number {
    if (
      this.totalEvents === 0
    ) {
      return 0;
    }

    return Number(
      (
        (
          count /
          this.totalEvents
        ) *
        100
      ).toFixed(1),
    );
  }

  /* =========================
     METADATA
  ========================= */

  showMetadata(
    metadata: any,
  ): void {
    if (
      !metadata ||
      metadata === 'null'
    ) {
      this.openMetadataModal(
        'Sin Detalles',
        {
          mensaje:
            'Este evento no tiene información adicional registrada.',
        },
      );

      return;
    }

    this.openMetadataModal(
      'Detalles del Evento',
      metadata,
    );
  }


  /* =========================
     OPEN METADATA MODAL
  ========================= */

  openMetadataModal(
    title: string,
    metadata: any,
  ): void {
    let parsed;

    try {
      parsed =
        typeof metadata === 'string'
          ? JSON.parse(metadata)
          : metadata;
    } catch {
      parsed = {
        raw: metadata,
      };
    }

    this.modal = {
      ...modalInitializer(),

      show: true,

      title,

      isMetadataViewer: true,

      metadata: parsed,

      close: () => {
        this.modal.show = false;
      },
    };
  }


  /* =========================
     EVENT TYPE
  ========================= */

  // mapEventType(eventType: EventTypeE) {
  //   return EventTypeE[eventType as keyof typeof EventTypeE];
  // }

  protected readonly EventTypeE =
    EventTypeE;
}