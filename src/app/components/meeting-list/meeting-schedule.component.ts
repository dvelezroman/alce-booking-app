import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeetingDTO } from '../../services/dtos/booking.dto';

@Component({
  selector: 'app-meeting-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meeting-schedule.component.html',
  styleUrl: './meeting-schedule.component.scss'
})
export class MeetingScheduleComponent {
  @Input() meetings: MeetingDTO[] = [];
  @Input() variant: 'scroll' | 'cards' = 'scroll';
  @Output() openDetail = new EventEmitter<{ meeting: MeetingDTO; index: number }>();
  @Output() deleteMeeting = new EventEmitter<MeetingDTO>();

  @ViewChild('scheduleList') scheduleList!: ElementRef;
  canScrollLeft = false;
  canScrollRight = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScroll();
  }

  ngAfterViewInit() {
    setTimeout(() => this.checkScroll(), 300);
  }

  checkScroll() {
    if (!this.scheduleList?.nativeElement) return;
    const el = this.scheduleList.nativeElement;
    this.canScrollLeft = el.scrollLeft > 0;
    this.canScrollRight = el.scrollWidth > el.clientWidth;
  }

  scrollLeft() {
    this.scheduleList.nativeElement.scrollBy({ left: -330, behavior: 'smooth' });
    setTimeout(() => this.checkScroll(), 300);
  }

  scrollRight() {
    this.scheduleList.nativeElement.scrollBy({ left: 330, behavior: 'smooth' });
    setTimeout(() => this.checkScroll(), 300);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    const formattedDate = new Date(date);
    return formattedDate.toDateString() === today.toDateString();
  }

  isTomorrow(date: Date): boolean {
    const formattedDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    return formattedDate.toDateString() === tomorrow.toDateString();
  }

  isCurrentWeek(date: Date): boolean {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    startOfWeek.setHours(0, 0, 0, 0);
    endOfWeek.setHours(23, 59, 59, 999);

    const targetDate = new Date(date);
    return targetDate >= startOfWeek && targetDate <= endOfWeek;
  }

  capitalizeFirstLetter(value: string | null): string {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
  }

  canDeleteMeeting(meeting: MeetingDTO): boolean {
    const utcNow = new Date();
    const ecuadorNow = new Date(utcNow.getTime() - 5 * 60 * 60 * 1000);
    const meetingDate = new Date(meeting.localdate);

    return !(meeting.linkOpened || meeting.markAssistanceById || ecuadorNow > meetingDate);
  }

  handleOpenDetail(meeting: MeetingDTO, index: number) {
    this.openDetail.emit({ meeting, index });
  }

  handleDelete(meeting: MeetingDTO, event: Event) {
    event.stopPropagation();
    this.deleteMeeting.emit(meeting);
  }
}
