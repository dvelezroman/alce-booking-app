import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { Observable, Subject, takeUntil } from 'rxjs'

import { ScheduledMeetingsHeaderComponent } from '../../../components/scheduled-meetings/scheduled-meetings-header/scheduled-meetings-header.component'
import { ScheduledMeetingsSummaryComponent } from '../../../components/scheduled-meetings/scheduled-meetings-summary/scheduled-meetings-summary.component'
import { ScheduledMeetingsFiltersComponent } from '../../../components/scheduled-meetings/scheduled-meetings-filters/scheduled-meetings-filters.component'

import { BookingService } from '../../../services/booking.service'
import {
  MeetingDTO,
  MeetingStatusEnum,
} from '../../../services/dtos/booking.dto'
import { UserDto } from '../../../services/dtos/user.dto'
import { selectUserData } from '../../../store/user.selector'
import { ScheduledMeetingsListComponent } from '../../../components/scheduled-meetings/scheduled-meetings-list/scheduled-meetings-list.component'
import { ScheduledMeetingsPaginationComponent } from '../../../components/scheduled-meetings/scheduled-meetings-pagination/scheduled-meetings-pagination.component'
import { MeetingDetailModalComponent } from '../../../components/scheduled-meetings/meeting-detail-modal/meeting-detail-modal.component'
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto'
import { ModalComponent } from '../../../components/modal/modal.component'

@Component({
  selector: 'app-scheduled-meetings',
  standalone: true,
  imports: [
    CommonModule,
    ScheduledMeetingsHeaderComponent,
    ScheduledMeetingsSummaryComponent,
    ScheduledMeetingsFiltersComponent,
    ScheduledMeetingsListComponent,
    ScheduledMeetingsPaginationComponent,
    MeetingDetailModalComponent,
    ModalComponent,
],
  templateUrl: './scheduled-meetings.component.html',
  styleUrl: './scheduled-meetings.component.scss',
})
export class ScheduledMeetingsComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<void>()

  userData$: Observable<UserDto | null>
  userData: UserDto | null = null

  meetings: MeetingDTO[] = []
  filteredMeetings: MeetingDTO[] = []

  selectedMeeting: MeetingDTO | null = null
  isMeetingDetailModalActive = false

  searchTerm = ''
  selectedDateFilter = 'all'
  selectedStatusFilter = 'all'
  selectedView: 'list' | 'grid' = 'list'

  isLoadingMeetings = false
  isDeletingMeeting = false

  currentPage = 1
  itemsPerPage = 6

  modalConfig: ModalDto = modalInitializer()
  meetingToDelete: MeetingDTO | null = null


  constructor(
    private readonly store: Store,
    private readonly bookingService: BookingService
  ) {
    this.userData$ = this.store.select(selectUserData)
  }

  ngOnInit(): void {
    this.userData$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((state) => {
        this.userData = state

        const studentId = state?.student?.id

        if (!studentId) {
          this.meetings = []
          this.filteredMeetings = []
          return
        }

        this.loadMeetings(studentId)
      })
  }

  private loadMeetings(studentId: number): void {
    this.isLoadingMeetings = true

    this.bookingService
      .searchMeetings({
        studentId,
        assigned: undefined,
        status: MeetingStatusEnum.ACTIVE,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (meetings: MeetingDTO[]) => {
          this.meetings = meetings
          this.applyFilters()
          this.isLoadingMeetings = false
        },
        error: (error) => {
          console.error(
            'Error obteniendo las clases agendadas:',
            error
          )

          this.meetings = []
          this.filteredMeetings = []
          this.isLoadingMeetings = false
        },
      })
  }

  get paginatedMeetings(): MeetingDTO[] {
    const startIndex =
      (this.currentPage - 1) * this.itemsPerPage

    const endIndex =
      startIndex + this.itemsPerPage

    return this.filteredMeetings.slice(
      startIndex,
      endIndex
    )
  }

   get totalPages(): number {
    return Math.ceil(
      this.filteredMeetings.length /
        this.itemsPerPage
    )
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return
    }

    this.currentPage = page
  }

  onViewMeetingDetails( meeting: MeetingDTO ): void {
    this.selectedMeeting = meeting
    this.isMeetingDetailModalActive = true
  }

  onCloseMeetingDetailModal(): void {
    this.isMeetingDetailModalActive = false
    this.selectedMeeting = null
  }

  onOpenMeetingOptions(meeting: MeetingDTO): void {
    console.log('Abrir opciones:', meeting)
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value
    this.applyFilters()
  }

  onDateFilterChange(value: string): void {
    this.selectedDateFilter = value
    this.applyFilters()
  }

  onStatusFilterChange(value: string): void {
    this.selectedStatusFilter = value
    this.applyFilters()
  }

  onViewChange(view: 'list' | 'grid'): void {
    this.selectedView = view
  }

  private applyFilters(): void {
    const normalizedSearch = this.searchTerm
      .trim()
      .toLowerCase()

    this.filteredMeetings = this.meetings
      .filter((meeting) => {
        const matchesSearch = this.matchesSearch(
          meeting,
          normalizedSearch
        )

        const matchesDate =
          this.matchesDateFilter(meeting)

        const matchesStatus =
          this.matchesStatusFilter(meeting)

        return (
          matchesSearch &&
          matchesDate &&
          matchesStatus
        )
      })
      .sort((meetingA, meetingB) => {
        const dateA = new Date(
          meetingA.localdate ?? meetingA.date
        ).getTime()

        const dateB = new Date(
          meetingB.localdate ?? meetingB.date
        ).getTime()

        return dateB - dateA
      })

    this.currentPage = 1
  }

  private matchesSearch(
    meeting: MeetingDTO,
    search: string
  ): boolean {
    if (!search) {
      return true
    }

    const instructorUser = meeting.instructor?.user

    const firstName =
      instructorUser?.firstName
        ?.trim()
        .toLowerCase() ?? ''

    const lastName =
      instructorUser?.lastName
        ?.trim()
        .toLowerCase() ?? ''

    const email =
      instructorUser?.email
        ?.trim()
        .toLowerCase() ?? ''

    const searchableText = [
      firstName,
      lastName,
      `${firstName} ${lastName}`.trim(),
      email,
    ].join(' ')

    return searchableText.includes(search)
  }

  private matchesDateFilter(
    meeting: MeetingDTO
  ): boolean {
    if (this.selectedDateFilter === 'all') {
      return true
    }

    const meetingDate = new Date(
      meeting.localdate || meeting.date
    )

    if (Number.isNaN(meetingDate.getTime())) {
      return false
    }

    const now = new Date()

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )

    const startOfMeetingDay = new Date(
      meetingDate.getFullYear(),
      meetingDate.getMonth(),
      meetingDate.getDate()
    )

    switch (this.selectedDateFilter) {
      case 'today':
        return (
          startOfMeetingDay.getTime() ===
          startOfToday.getTime()
        )

      case 'week': {
        const endOfWeek = new Date(startOfToday)

        endOfWeek.setDate(
          startOfToday.getDate() + 7
        )

        return (
          meetingDate >= startOfToday &&
          meetingDate < endOfWeek
        )
      }

      case 'month':
        return (
          meetingDate.getFullYear() ===
            now.getFullYear() &&
          meetingDate.getMonth() ===
            now.getMonth()
        )

      case 'upcoming':
        return meetingDate >= now

      case 'past':
        return meetingDate < now

      default:
        return true
    }
  }

  private matchesStatusFilter(
    meeting: MeetingDTO
  ): boolean {
    if (this.selectedStatusFilter === 'all') {
      return true
    }

    const meetingStatus = String(
      meeting.status ?? ''
    ).toLowerCase()

    return (
      meetingStatus ===
      this.selectedStatusFilter.toLowerCase()
    )
  }

  openDeleteModal(meeting: MeetingDTO): void {
    if (!meeting?.id || this.isDeletingMeeting) {
      return
    }

    this.meetingToDelete = meeting

    this.modalConfig = {
      show: true,
      message:
        '¿Estás seguro de que deseas eliminar esta clase?',
      isError: false,
      isSuccess: false,
      isInfo: true,
      showButtons: true,
      close: () => this.closeDeleteModal(),
      confirm: () => this.confirmDelete(),
    }
  }

  confirmDelete(): void {
    const meeting = this.meetingToDelete

    if (!meeting?.id || this.isDeletingMeeting) {
      return
    }

    this.isDeletingMeeting = true

    this.bookingService
      .deleteMeeting(meeting.id)
      .subscribe({
        next: () => {
          this.meetings = this.meetings.filter(
            (item) => item.id !== meeting.id
          )

          this.applyFilters()
          this.closeDeleteModal()

          this.showModalMessage(
            'La clase fue eliminada correctamente.',
            false,
            false,
            true
          )
        },
        error: (error: Error) => {
          console.error(
            'Error al eliminar la clase:',
            error
          )

          this.isDeletingMeeting = false
          this.closeDeleteModal()

          this.showModalMessage(
            'No se pudo eliminar la clase.',
            true
          )
        },
        complete: () => {
          this.isDeletingMeeting = false
        },
      })
  }

  closeDeleteModal(): void {
    this.modalConfig = modalInitializer()
    this.meetingToDelete = null
    this.isDeletingMeeting = false
  }

  showModalMessage(
    message: string,
    isError = true,
    isInfo = false,
    isSuccess = false,
    duration = 3000
  ): void {
    this.modalConfig = {
      show: true,
      message,
      isError,
      isSuccess,
      isInfo,
      showButtons: false,
      close: () => {
        this.modalConfig = modalInitializer()
      },
    }

    setTimeout(() => {
      this.modalConfig.close()
    }, duration)
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }
}