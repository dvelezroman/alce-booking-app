import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateMeetingDto } from "./dtos/booking.dto";

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/meetings`; // Adjust the API endpoint as needed

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  bookMeeting(bookingData: CreateMeetingDto): Observable<any> {
    return this.http.post(`${this.apiUrl}`, bookingData, { headers: this.getHeaders() })
  }
}

