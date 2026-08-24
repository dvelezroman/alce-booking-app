import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AnnouncementService } from '../../../services/announcement.service';

type AnnouncementMediaType = 'image' | 'video';

@Component({
  selector: 'app-announcement-v2-media',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './announcement-v2-media.component.html',
  styleUrl: './announcement-v2-media.component.scss',
})
export class AnnouncementV2MediaComponent {

  /* =========================================================
     INPUTS
  ========================================================= */

  @Input() media?: string;
  @Input() originalMedia?: string;
  @Input() mediaType: AnnouncementMediaType = 'image';

  /* =========================================================
     OUTPUTS
  ========================================================= */

  @Output() mediaChange = new EventEmitter<string | undefined>();
  @Output() mediaTypeChange = new EventEmitter<AnnouncementMediaType>();
  @Output() error = new EventEmitter<string>();

  /* =========================================================
     STATE
  ========================================================= */

  file: File | null = null;
  uploading = false;
  uploaded = false;
  uploadError: string | null = null;
  useUrl = false;
  urlInput = '';
  fileSizeLabel: string | null = null;
  dragActive = false;

  /* =========================================================
     LIMITS
  ========================================================= */

  private readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024;
  private readonly MAX_VIDEO_SIZE = 50 * 1024 * 1024;

  constructor(
    private readonly announcementService: AnnouncementService,
  ) {}

  /* =========================================================
     GETTERS
  ========================================================= */

  get currentMedia(): string | undefined {
    return this.media || this.originalMedia;
  }

  get hasMedia(): boolean {
    return !!this.currentMedia;
  }

  get acceptTypes(): string {
    return this.mediaType === 'image' ? 'image/*' : 'video/*';
  }

  get maxSizeLabel(): string {
    return this.mediaType === 'image' ? '10 MB' : '50 MB';
  }

  get urlPlaceholder(): string {
    return this.mediaType === 'image'
      ? 'https://ejemplo.com/imagen.jpg'
      : 'https://youtube.com/... o https://ejemplo.com/video.mp4';
  }

  /* =========================================================
     MEDIA TYPE
  ========================================================= */

  selectMediaType(type: AnnouncementMediaType): void {
    if (this.mediaType === type) {
      return;
    }

    this.mediaType = type;

    console.log(
      '[MEDIA CHILD] tipo seleccionado:',
      type,
    );

    this.mediaTypeChange.emit(type);

    this.resetState();
  }

  /* =========================================================
     MODE
  ========================================================= */

  switchMode(useUrl: boolean): void {
    this.useUrl = useUrl;

    console.log(
      '[MEDIA CHILD] modo:',
      useUrl ? 'URL' : 'ARCHIVO',
    );

    this.resetState();
    this.urlInput = '';
  }

  /* =========================================================
     RESET
  ========================================================= */

  resetState(): void {
    this.media = undefined;
    this.file = null;
    this.uploading = false;
    this.uploaded = false;
    this.uploadError = null;
    this.fileSizeLabel = null;
    this.dragActive = false;

    console.log(
      '[MEDIA CHILD] emit reset:',
      undefined,
    );

    this.mediaChange.emit(undefined);
  }

  /* =========================================================
     FILE
  ========================================================= */

  handleFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    console.log(
      '[MEDIA CHILD] archivo seleccionado:',
      {
        name: file.name,
        type: file.type,
        size: file.size,
      },
    );

    this.processFile(file);

    input.value = '';
  }

  /* =========================================================
     DRAG
  ========================================================= */

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = false;

    const file = event.dataTransfer?.files?.[0];

    if (!file) {
      return;
    }

    console.log(
      '[MEDIA CHILD] archivo arrastrado:',
      {
        name: file.name,
        type: file.type,
        size: file.size,
      },
    );

    this.processFile(file);
  }

  /* =========================================================
     PROCESS FILE
  ========================================================= */

  private processFile(file: File): void {
    this.media = undefined;
    this.file = null;
    this.uploading = false;
    this.uploaded = false;
    this.uploadError = null;
    this.fileSizeLabel = null;

    /* =======================================================
       VALIDATE TYPE
    ======================================================= */

    if (
      this.mediaType === 'image' &&
      !file.type.startsWith('image/')
    ) {
      this.setError('Debe seleccionar una imagen');
      return;
    }

    if (
      this.mediaType === 'video' &&
      !file.type.startsWith('video/')
    ) {
      this.setError('Debe seleccionar un video');
      return;
    }

    /* =======================================================
       LOCAL PREVIEW
    ======================================================= */

    this.file = file;

    this.media = URL.createObjectURL(file);

    console.log(
      '[MEDIA CHILD] preview local generado:',
      this.media,
    );

    this.fileSizeLabel = this.formatFileSize(file.size);

    /* =======================================================
       SIZE
    ======================================================= */

    const maxSize =
      this.mediaType === 'image'
        ? this.MAX_IMAGE_SIZE
        : this.MAX_VIDEO_SIZE;

    if (file.size > maxSize) {
      this.uploadError =
        this.mediaType === 'image'
          ? 'La imagen no debe superar los 10MB'
          : 'El video no debe superar los 50MB';

      console.log(
        '[MEDIA CHILD] error tamaño:',
        this.uploadError,
      );

      this.error.emit(this.uploadError);
    } else {
      this.uploadError = null;
    }

    /*
     * IMPORTANTE:
     *
     * Igual al flujo anterior,
     * aquí NO se emite el blob al padre.
     *
     * El padre recibe la URL cuando:
     *
     * 1. se sube a S3
     * 2. se aplica una URL externa
     */
  }

  /* =========================================================
     UPLOAD
  ========================================================= */

  async uploadToS3(): Promise<void> {
    if (this.uploadError) {
      return;
    }

    if (!this.file) {
      return;
    }

    this.uploading = true;

    console.log(
      '[MEDIA CHILD] iniciando subida:',
      this.file.name,
    );

    try {
      const res = await firstValueFrom(
        this.announcementService.uploadMedia(this.file),
      );

      const url = res.url;

      console.log(
        '[MEDIA CHILD] URL recibida de S3:',
        url,
      );

      this.media = url;

      /*
       * ESTE ES EL EMIT QUE
       * DEBE LLEGAR AL PADRE.
       */

      console.log(
        '[MEDIA CHILD] emit S3 al padre:',
        url,
      );

      this.mediaChange.emit(url);

      this.uploaded = true;
    } catch (err) {
      console.error(
        '[MEDIA CHILD] error al subir:',
        err,
      );

      this.uploadError = 'Error al subir el archivo';

      this.error.emit(this.uploadError);

      this.uploaded = false;
    } finally {
      this.uploading = false;
    }
  }

  /* =========================================================
     URL
  ========================================================= */

  applyUrl(): void {
    const url = this.urlInput.trim();

    if (!url) {
      this.uploadError = 'Debes ingresar una URL';
      this.uploaded = false;

      this.error.emit(this.uploadError);

      return;
    }

    /*
     * Igual al flujo anterior.
     */

    this.resetState();

    this.urlInput = url;
    this.media = url;

    console.log(
      '[MEDIA CHILD] URL aplicada:',
      url,
    );

    /*
     * ESTE ES EL SEGUNDO EMIT
     * QUE DEBE LLEGAR AL PADRE.
     */

    console.log(
      '[MEDIA CHILD] emit URL al padre:',
      url,
    );

    this.mediaChange.emit(url);

    this.uploaded = true;
    this.uploadError = null;
  }

  /* =========================================================
     URL INPUT
  ========================================================= */

  onUrlInput(value: string): void {
    this.urlInput = value;
    this.uploaded = false;
    this.uploadError = null;
  }

  /* =========================================================
     REMOVE
  ========================================================= */

  remove(event?: Event): void {
    event?.stopPropagation();

    this.resetState();

    this.urlInput = '';
  }

  /* =========================================================
     CHANGE MEDIA
  ========================================================= */

  changeMedia(): void {
    this.remove();
  }

  /* =========================================================
     INPUT
  ========================================================= */

  triggerInput(input: HTMLInputElement): void {
    input.click();
  }

  /* =========================================================
     VALIDATE URL
  ========================================================= */

  private isValidUrl(value: string): boolean {
    try {
      const parsed = new URL(value);

      return (
        parsed.protocol === 'http:' ||
        parsed.protocol === 'https:'
      );
    } catch {
      return false;
    }
  }

  /* =========================================================
     ERROR
  ========================================================= */

  private setError(message: string): void {
    this.uploadError = message;

    console.log(
      '[MEDIA CHILD] error:',
      message,
    );

    this.error.emit(message);
  }

  /* =========================================================
     FORMAT SIZE
  ========================================================= */

  formatFileSize(size: number): string {
    if (size >= 1024 * 1024) {
      return (
        (size / 1024 / 1024).toFixed(2) +
        ' MB'
      );
    }

    return (
      (size / 1024).toFixed(1) +
      ' KB'
    );
  }
}