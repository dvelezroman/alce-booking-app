import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {CreateMeetingDto} from '../meeting-booking/booking.dto';


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

  book(bookingData: CreateMeetingDto): Observable<any> {
    return this.http.post(`${this.apiUrl}`, bookingData, { headers: this.getHeaders() })
  }

  // Create a new person
  createPerson(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, formData, { headers: this.getHeaders() });
  }

  // Update an existing person
  updatePerson(id: number, formData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData, { headers: this.getHeaders() });
  }

  // Delete a person
  deletePerson(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Get a list of people
  getPeople(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, { headers: this.getHeaders() });
  }

  // Get a specific person by ID
  getPerson(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Get players by team ID
  getPlayersByTeam(teamId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/team/${teamId}`, { headers: this.getHeaders() });
  }
}

