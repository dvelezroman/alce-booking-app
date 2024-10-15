import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateMeetingDto,
  FilterInstructorMeetingDto,
  FilterMeetingsDto,
  MeetingDTO,
  UpdateMeetingLinkDto
} from "./dtos/booking.dto";

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/meetings`; // Adjust the API endpoint as needed

  constructor(private http: HttpClient) {}

  bookMeeting(bookingData: CreateMeetingDto
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/book`, bookingData)
  }

  searchMeetings(filterParams: FilterMeetingsDto): Observable<MeetingDTO[]> {
    const {
      from,
      to,
      hour,
      studentId,
      stageId,
      assigned,
      instructorId,
    } = filterParams;
    let params = new HttpParams();

    if (from) {
      if (to) {
        params = params.set('from', from);
      } else {
        params = params.set('date', from);
      }
    }

    if (to) {
      params = params.set('to', to);
    }

    if (hour !== undefined) {
      params = params.set('hour', hour.toString());
    }

    if (studentId !== undefined) {
      params = params.set('studentId', studentId);
    }

    if (stageId !== undefined) {
      params = params.set('stageId', stageId);
    }

    if (assigned) {
      params = params.set('assigned', assigned);
    }

    if (instructorId) {
      params = params.set('instructorId', instructorId);
    }

    return this.http.get<MeetingDTO[]>(`${this.apiUrl}/search`, { params });
  }

  updateMeetingLink(data: UpdateMeetingLinkDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/link`, data);
  }

  deleteMeeting(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateAssistance(id: number, present: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/assistance/${id}`, { present });
  }

  getInstructorMeetingsGroupedByHour(data: FilterInstructorMeetingDto): Observable<any> {
    const { from, to, instructorId } = data;
    let params = new HttpParams();

    if (from) {
      if (to) {
        params = params.set('from', from);
      } else {
        params = params.set('date', from);
      }
    }

    if (to) {
      params = params.set('to', to);
    }

    if (instructorId) {
      params = params.set('instructorId', instructorId);
    }

    return this.http.get(`${this.apiUrl}/meetings/grouped-by-hour`, { params });
  }
}

