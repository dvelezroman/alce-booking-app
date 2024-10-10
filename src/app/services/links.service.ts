import {Store} from "@ngrx/store";
import {CreateStageDto, UpdateStageDto} from "./dtos/student.dto";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Injectable} from "@angular/core";
import {MeetingLinkDto} from "./dtos/booking.dto";

@Injectable({
  providedIn: 'root',
})
export class LinksService {
  private apiUrl = `${environment.apiUrl}/links`;

  constructor(
    private http: HttpClient,
    private store: Store,
  ) {}

  getById(id: number): Observable<MeetingLinkDto> {
    return this.http.get<MeetingLinkDto>(`${this.apiUrl}/${id}`);
  }

  getAll(): Observable<MeetingLinkDto[]> {
    return this.http.get<MeetingLinkDto[]>(`${this.apiUrl}`)
  }

  create(data: CreateStageDto): Observable<MeetingLinkDto> {
    return this.http.post<MeetingLinkDto>(`${this.apiUrl}`, data);
  }

  update(id: number, data: UpdateStageDto): Observable<MeetingLinkDto> {
    return this.http.patch<MeetingLinkDto>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
