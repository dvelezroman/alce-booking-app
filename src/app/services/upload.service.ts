import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UploadService {

  constructor(private http: HttpClient) {}

  async uploadMedia(file: File): Promise<string> {

    const formData = new FormData();
    formData.append('file', file);

    // detectar tipo automáticamente
    const isVideo = file.type.startsWith('video/');
    const folder = isVideo ? 'videos' : 'images';

    const res: any = await firstValueFrom(
      this.http.post(
        `/api/upload/media?subfolder=announcements/${folder}`,
        formData
      )
    );

    return res.url;
  }
}