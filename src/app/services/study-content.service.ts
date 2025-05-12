import {Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
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

  filterBy(stageId?: number, unit?: number): Observable<StudyContentDto[]> {
    let params = new HttpParams();

    if (!!stageId) {
      params = params.set('stageId', stageId.toString());
    }

    if (!!unit) {
      params = params.set('unit', unit.toString());
    }

    return this.http.get<StudyContentDto[]>(`${this.apiUrl}/filter`, { params });
  }

  create(data: StudyContentCreateDto): Observable<StudyContentDto> {
  return this.http.post<StudyContentDto>(`${this.apiUrl}`, data);
  }

  update(id: number, data: StudyContentUpdateDto): Observable<StudyContentDto> {
    return this.http.patch<StudyContentDto>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getManyStudyContents(studyContentIds: number[]): Observable<StudyContentDto[]> {
    const params = new HttpParams({
      fromObject: {
        ids: studyContentIds.map(String),
      },
    });

    return this.http.get<StudyContentDto[]>(`${this.apiUrl}/batch/content`, { params });
  }
}
