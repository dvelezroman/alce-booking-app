import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from '../../../services/upload.service';
import { FormsModule } from '@angular/forms';

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
  @Output() mediaChange = new EventEmitter<string | undefined>();

  @Input() type: MediaType = 'image';

  file: File | null = null;
  uploading = false;
  uploaded = false;
  error: string | null = null;

  useUrl = false;
  urlInput: string = '';

  fileSizeLabel: string | null = null;

  // LÍMITES
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  private readonly MAX_VIDEO_SIZE = 50 * 1024 * 1024;

  constructor(private uploadService: UploadService) {}

  // =========================
  // CAMBIAR MODO (CLAVE)
  // =========================
  switchMode(useUrl: boolean) {
    this.useUrl = useUrl;

    // limpiar TODO
    this.resetState();

    // limpiar input URL
    this.urlInput = '';
  }

  // =========================
  // RESET GLOBAL
  // =========================
  resetState() {
    this.media = undefined;
    this.file = null;
    this.uploading = false;
    this.uploaded = false;
    this.error = null;
    this.fileSizeLabel = null;

    this.mediaChange.emit(undefined);
  }

  // =========================
  // SELECCIONAR ARCHIVO
  // =========================
  handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // limpiar estado previo
    this.resetState();

    // VALIDAR TIPO
    if (this.type === 'image' && !file.type.startsWith('image/')) {
      this.error = 'Debe seleccionar una imagen';
      return;
    }

    if (this.type === 'video' && !file.type.startsWith('video/')) {
      this.error = 'Debe seleccionar un video';
      return;
    }

    // PREVIEW SIEMPRE
    this.file = file;
    this.media = URL.createObjectURL(file);

    // tamaño
    this.fileSizeLabel = this.formatFileSize(file.size);

    // VALIDACIÓN
    const maxSize =
      this.type === 'image'
        ? this.MAX_IMAGE_SIZE
        : this.MAX_VIDEO_SIZE;

    if (file.size > maxSize) {
      this.error =
        this.type === 'image'
          ? 'La imagen no debe superar los 5MB'
          : 'El video no debe superar los 50MB';
    } else {
      this.error = null;
    }
  }

  // =========================
  // SUBIR A S3
  // =========================
  async uploadToS3() {

    if (this.error) return;
    if (!this.file) return;

    this.uploading = true;

    try {
      const url = await this.uploadService.uploadMedia(this.file);

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

  // =========================
  // USAR URL
  // =========================
  applyUrl() {
    if (!this.urlInput) return;

    this.resetState();

    this.media = this.urlInput;
    this.mediaChange.emit(this.urlInput);

    this.uploaded = true;
  }

  // =========================
  // ELIMINAR
  // =========================
  remove(event: Event) {
    event.stopPropagation();
    this.resetState();
    this.urlInput = '';
  }

  // =========================
  // INPUT FILE
  // =========================
  triggerInput(input: HTMLInputElement) {
    input.click();
  }

  // =========================
  // FORMATO TAMAÑO
  // =========================
  formatFileSize(size: number): string {
    if (size >= 1024 * 1024) {
      return (size / 1024 / 1024).toFixed(2) + ' MB';
    }
    return (size / 1024).toFixed(1) + ' KB';
  }
}