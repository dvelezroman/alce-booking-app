import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {CreateMeetingDto, FilterMeetingsDto, MeetingDTO, UpdateMeetingLinkDto} from "./dtos/booking.dto";

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
    const { from, to, hour, studentId, stageId} = filterParams;
    let params = new HttpParams();

    if (from) {
      params = params.set('from', from);
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

    return this.http.get<MeetingDTO[]>(`${this.apiUrl}/search`, { params });
  }

  updateMeetingLink(data: UpdateMeetingLinkDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/meetings/link`, data);
  }
}

