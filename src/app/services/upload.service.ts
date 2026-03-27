import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UploadService {

  constructor(private http: HttpClient) {}

  async uploadImage(file: File): Promise<string> {

    const formData = new FormData();
    formData.append('file', file);

    const res: any = await firstValueFrom(
      this.http.post(
        '/api/upload/image?subfolder=announcements',
        formData
      )
    );

    return res.url;
  }
}