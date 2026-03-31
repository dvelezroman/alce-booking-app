import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UploadService {

  constructor(private http: HttpClient) {}

  async uploadMedia(file: File): Promise<string> {

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken');

    const res: any = await firstValueFrom(
      this.http.post(
        `${environment.apiUrl}/upload/image?subfolder=alce-announcements`,
        formData,
        {
          headers: {
            'x-access-token': token || ''
          }
        }
      )
    );

    return res.url;
  }
}