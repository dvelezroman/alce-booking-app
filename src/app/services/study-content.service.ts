import {CreateStageDto, UpdateStageDto} from "./dtos/student.dto";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Injectable} from "@angular/core";
import {StudyContentCreateDto, StudyContentDto, StudyContentUpdateDto} from "./dtos/study-content.dto";

@Injectable({
  providedIn: 'root',
})
export class StudyContentService {
  private apiUrl = `${environment.apiUrl}/study-content`;

  constructor(
    private http: HttpClient,
  ) {}

  getById(id: number): Observable<StudyContentDto> {
    return this.http.get<StudyContentDto>(`${this.apiUrl}/${id}`);
  }

  getAll(): Observable<StudyContentDto[]> {
    return this.http.get<StudyContentDto[]>(`${this.apiUrl}`)
  }

  create(data: CreateStageDto): Observable<StudyContentCreateDto> {
    return this.http.post<StudyContentDto>(`${this.apiUrl}`, data);
  }

  update(id: number, data: UpdateStageDto): Observable<StudyContentUpdateDto> {
    return this.http.patch<StudyContentDto>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
