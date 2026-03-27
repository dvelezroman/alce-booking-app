import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from '../../../services/upload.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss'
})
export class ImageUploadComponent {

  @Input() image?: string;
  @Output() imageChange = new EventEmitter<string | undefined>();

  file: File | null = null;
  uploading = false;
  uploaded = false;
  error: string | null = null;

  // LÍMITE (5MB)
  private readonly MAX_SIZE = 5 * 1024 * 1024;

  constructor(private uploadService: UploadService) {}

  // =========================
  // SELECCIONAR IMAGEN
  // =========================
  handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // PREVIEW SIEMPRE
    this.file = file;
    this.image = URL.createObjectURL(file);
    this.uploaded = false;

    // VALIDACIÓN
    if (file.size > this.MAX_SIZE) {
      this.error = 'La imagen no debe ser mayor a 5MB';
    } else {
      this.error = null;
    }
  }

  // =========================
  // SUBIR A S3
  // =========================
  async uploadToS3() {

    if (this.error) {
      this.error = 'La imagen no debe ser mayor a 5MB';
      return;
    }

    if (!this.file) return;

    this.uploading = true;

    try {
      const url = await this.uploadService.uploadImage(this.file);

      this.image = url;
      this.imageChange.emit(url);
      this.uploaded = true;

    } catch (err) {
      console.error('❌ Error al subir imagen:', err);
      this.error = 'Error al subir la imagen';
      this.uploaded = false;
    } finally {
      this.uploading = false;
    }
  }

  // =========================
  // ELIMINAR
  // =========================
  removeImage(event: Event) {
    event.stopPropagation();

    this.image = undefined;
    this.file = null;
    this.uploaded = false;
    this.error = null;

    this.imageChange.emit(undefined);
  }

  // =========================
  // TRIGGER INPUT
  // =========================
  triggerInput(input: HTMLInputElement) {
    input.click();
  }
}