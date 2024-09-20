import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/meetings`; // Adjust the API endpoint as needed

  constructor(private http: HttpClient) {}

  bookMeeting(bookingData: {
    studentId: number;
    date: Date;
    hour: number;
    instructorId: number | null;
    stageId: number | undefined
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/book`, bookingData)
  }
}

