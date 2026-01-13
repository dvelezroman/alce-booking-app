import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EcuadorTimeDto } from './dtos/time.dto';

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  private apiUrl = `${environment.apiUrl}/time`;

  constructor(private http: HttpClient) {}

  getCurrentEcuadorTime(): Observable<EcuadorTimeDto> {
    return this.http.get<EcuadorTimeDto>(this.apiUrl);
  }
}