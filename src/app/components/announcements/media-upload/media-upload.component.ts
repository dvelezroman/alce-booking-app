import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnouncementService } from '../../../services/announcement.service';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

type MediaType = 'image' | 'video';

@Component({
  selector: 'app-media-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './media-upload.component.html',
  styleUrl: './media-upload.component.scss'
})
export class MediaUploadComponent {

  @Input() media?: string;
  @Input() type: MediaType = 'image';
  @Input() aspectRatio: 'horizontal' | 'vertical' | 'square' = 'horizontal';

  @Output() aspectRatioChange = new EventEmitter<'horizontal' | 'vertical' | 'square'>();
  @Output() mediaChange = new EventEmitter<string | undefined>();

  file: File | null = null;
  uploading = false;
  uploaded = false;
  error: string | null = null;

  useUrl = false;
  urlInput: string = '';

  fileSizeLabel: string | null = null;

  private readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024;
  private readonly MAX_VIDEO_SIZE = 50 * 1024 * 1024;

  constructor(private announcementService: AnnouncementService) {}

  setAspect(value: 'horizontal' | 'vertical' | 'square') {
    this.aspectRatio = value;
    this.aspectRatioChange.emit(value);
  }

  switchMode(useUrl: boolean) {
    this.useUrl = useUrl;
    this.resetState();
    this.urlInput = '';
  }

  resetState() {
    this.media = undefined;
    this.file = null;
    this.uploading = false;
    this.uploaded = false;
    this.error = null;
    this.fileSizeLabel = null;

    this.mediaChange.emit(undefined);
  }

  handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.resetState();

    if (this.type === 'image' && !file.type.startsWith('image/')) {
      this.error = 'Debe seleccionar una imagen';
      return;
    }

    if (this.type === 'video' && !file.type.startsWith('video/')) {
      this.error = 'Debe seleccionar un video';
      return;
    }

    this.file = file;
    this.media = URL.createObjectURL(file);
    this.fileSizeLabel = this.formatFileSize(file.size);

    const maxSize =
      this.type === 'image'
        ? this.MAX_IMAGE_SIZE
        : this.MAX_VIDEO_SIZE;

    if (file.size > maxSize) {
      this.error =
        this.type === 'image'
          ? 'La imagen no debe superar los 10MB'
          : 'El video no debe superar los 50MB';
    } else {
      this.error = null;
    }
  }

  // =========================
  // 🔥 SUBIR (NUEVO)
  // =========================
  async uploadToS3() {

    if (this.error) return;
    if (!this.file) return;

    this.uploading = true;

    try {
      const res = await firstValueFrom(
        this.announcementService.uploadMedia(this.file)
      );

      const url = res.url;

      this.media = url;
      this.mediaChange.emit(url);
      this.uploaded = true;

    } catch (err) {
      console.error('❌ Error al subir:', err);
      this.error = 'Error al subir el archivo';
      this.uploaded = false;
    } finally {
      this.uploading = false;
    }
  }

  applyUrl(): void {
    const url = this.urlInput.trim();

    if (!url) {
      this.error = 'Debes ingresar una URL';
      this.uploaded = false;
      return;
    }

    this.resetState();

    this.urlInput = url;
    this.media = url;
    this.mediaChange.emit(url);

    this.uploaded = true;
    this.error = null;
  }

  remove(event: Event) {
    event.stopPropagation();
    this.resetState();
    this.urlInput = '';
  }

  triggerInput(input: HTMLInputElement) {
    input.click();
  }

  formatFileSize(size: number): string {
    if (size >= 1024 * 1024) {
      return (size / 1024 / 1024).toFixed(2) + ' MB';
    }
    return (size / 1024).toFixed(1) + ' KB';
  }
}