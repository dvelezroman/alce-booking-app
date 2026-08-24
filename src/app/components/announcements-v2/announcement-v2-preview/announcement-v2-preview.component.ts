import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';

import {
  UserRole,
} from '../../../services/dtos/user.dto';

import {
  StudentClassification,
} from '../../../services/dtos/student.dto';

import {
  ActionButton,
} from '../announcement-v2-actions/announcement-v2-actions.component';


type AnnouncementMediaType =
  | 'image'
  | 'youtube'
  | 'google-drive'
  | 'video'
  | 'none';


@Component({
  selector: 'app-announcement-v2-preview',
  standalone: true,

  imports: [
    CommonModule,
  ],

  templateUrl:
    './announcement-v2-preview.component.html',

  styleUrl:
    './announcement-v2-preview.component.scss',

  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class AnnouncementV2PreviewComponent
  implements OnChanges {

  /* =========================================================
     INPUTS
  ========================================================= */

  @Input()
  title:
    string = '';

  @Input()
  type:
    string = '';

  @Input()
  media?: string;

  @Input()
  role:
    UserRole | null = null;

  @Input()
  studentClassification:
    StudentClassification | null = null;

  @Input()
  city:
    | 'Portoviejo'
    | 'Cuenca'
    | null = null;

  @Input()
  isActive:
    boolean = true;

  @Input()
  actions:
    ActionButton[] = [];

  @Input()
  aspectRatio:
    | 'horizontal'
    | 'vertical'
    | 'square' = 'horizontal';

  @Input()
  startDate?: string;

  @Input()
  endDate?: string;


  /* =========================================================
     MEDIA
  ========================================================= */

  mediaType:
    AnnouncementMediaType = 'none';

  safeEmbedUrl?:
    SafeResourceUrl;


  constructor(
    private readonly sanitizer:
      DomSanitizer,
  ) {}


  /* =========================================================
     CHANGES
  ========================================================= */

  ngOnChanges(
    changes: SimpleChanges,
  ): void {

    if (
      changes['media']
    ) {

      console.log(
        '[PREVIEW CHILD] media recibida:',
        this.media,
      );

      this.prepareMedia();
    }
  }


  /* =========================================================
     MEDIA GETTERS
  ========================================================= */

  get isYoutubeMedia(): boolean {
    return (
      this.mediaType === 'youtube'
    );
  }


  get isGoogleDriveMedia(): boolean {
    return (
      this.mediaType === 'google-drive'
    );
  }


  get isDirectVideoMedia(): boolean {
    return (
      this.mediaType === 'video'
    );
  }


  get isImageMedia(): boolean {
    return (
      this.mediaType === 'image'
    );
  }


  /* =========================================================
     ACTIONS
  ========================================================= */

  get actionButtons():
    ActionButton[] {

    return (
      this.actions?.filter(
        action =>
          action.type === 'action' ||
          action.type === 'whatsapp',
      ) || []
    );
  }


  get hasClose(): boolean {

    return (
      this.actions?.some(
        action =>
          action.type === 'close',
      ) || false
    );
  }


  get closeAction():
    ActionButton | undefined {

    return (
      this.actions?.find(
        action =>
          action.type === 'close',
      )
    );
  }


  /* =========================================================
     LABELS
  ========================================================= */

  get typeLabel(): string {

    switch (
      this.type
    ) {

      case 'promotion':
        return 'Promoción';

      case 'notice':
        return 'Aviso';

      case 'relocation':
        return 'Reubicación';

      default:
        return 'Anuncio';
    }
  }


  get roleLabel(): string {

    if (
      !this.role
    ) {
      return 'Todos los usuarios';
    }


    switch (
      this.role
    ) {

      case UserRole.STUDENT:
        return 'Estudiantes';

      case UserRole.INSTRUCTOR:
        return 'Instructores';

      case UserRole.ADMIN:
        return 'Administradores';

      default:
        return String(
          this.role,
        );
    }
  }


  get classificationLabel(): string {

    if (
      !this.studentClassification
    ) {
      return 'Todas las clasificaciones';
    }


    switch (
      this.studentClassification
    ) {

      case StudentClassification.KIDS:
        return 'Kids';

      case StudentClassification.TEENS:
        return 'Teens';

      case StudentClassification.ADULTS:
        return 'Adults';

      default:
        return String(
          this.studentClassification,
        );
    }
  }


  get cityLabel(): string {

    return (
      this.city ||
      'Todas las ciudades'
    );
  }


  /* =========================================================
     DATE
  ========================================================= */

  get validityLabel(): string {

    if (
      !this.startDate &&
      !this.endDate
    ) {
      return 'Sin fecha definida';
    }


    if (
      this.startDate &&
      this.endDate
    ) {

      return (
        `${this.formatDate(this.startDate)} - ` +
        `${this.formatDate(this.endDate)}`
      );
    }


    if (
      this.startDate
    ) {

      return (
        `Desde ${this.formatDate(
          this.startDate,
        )}`
      );
    }


    return (
      `Hasta ${this.formatDate(
        this.endDate!,
      )}`
    );
  }


  private formatDate(
    value: string,
  ): string {

    const date =
      new Date(
        `${value}T00:00:00`,
      );


    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return value;
    }


    return (
      new Intl.DateTimeFormat(
        'es-EC',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        },
      ).format(
        date,
      )
    );
  }


  /* =========================================================
     ASPECT
  ========================================================= */

  get aspectClass(): string {

    return (
      `announcement-v2-preview__media--${this.aspectRatio}`
    );
  }


  /* =========================================================
     PREPARE MEDIA
  ========================================================= */

  private prepareMedia(): void {

    this.mediaType =
      'none';

    this.safeEmbedUrl =
      undefined;


    const mediaUrl =
      this.media?.trim();


    if (
      !mediaUrl
    ) {
      return;
    }


    this.mediaType =
      this.detectMediaType(
        mediaUrl,
      );


    console.log(
      '[PREVIEW CHILD] mediaType:',
      this.mediaType,
    );


    if (
      this.isYoutubeMedia
    ) {

      this.safeEmbedUrl =
        this.buildYoutubeUrl(
          mediaUrl,
        );

      return;
    }


    if (
      this.isGoogleDriveMedia
    ) {

      this.safeEmbedUrl =
        this.buildGoogleDriveUrl(
          mediaUrl,
        );
    }
  }


  /* =========================================================
     DETECT MEDIA
  ========================================================= */

  private detectMediaType(
    url?: string,
  ): AnnouncementMediaType {

    const mediaUrl =
      url?.trim();


    if (
      !mediaUrl
    ) {
      return 'none';
    }


    if (
      this.isYoutubeUrl(
        mediaUrl,
      )
    ) {
      return 'youtube';
    }


    if (
      this.isGoogleDriveUrl(
        mediaUrl,
      )
    ) {
      return 'google-drive';
    }


    if (
      this.isDirectVideoUrl(
        mediaUrl,
      )
    ) {
      return 'video';
    }


    return 'image';
  }


  /* =========================================================
     DIRECT VIDEO
  ========================================================= */

  private isDirectVideoUrl(
    url: string,
  ): boolean {

    return (
      /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i
        .test(
          url,
        )
    );
  }


  /* =========================================================
     YOUTUBE
  ========================================================= */

  private isYoutubeUrl(
    url: string,
  ): boolean {

    try {

      const parsedUrl =
        new URL(
          url,
        );


      const hostname =
        parsedUrl.hostname
          .toLowerCase();


      return (
        hostname === 'youtu.be' ||
        hostname === 'www.youtu.be' ||
        hostname === 'youtube.com' ||
        hostname === 'www.youtube.com' ||
        hostname === 'm.youtube.com'
      );

    } catch {

      return false;
    }
  }


  private buildYoutubeUrl(
    url: string,
  ): SafeResourceUrl | undefined {

    const videoId =
      this.extractYoutubeVideoId(
        url,
      );


    if (
      !videoId
    ) {
      return undefined;
    }


    const embedUrl =
      `https://www.youtube.com/embed/${videoId}?rel=0`;


    return (
      this.sanitizer
        .bypassSecurityTrustResourceUrl(
          embedUrl,
        )
    );
  }


  private extractYoutubeVideoId(
    url: string,
  ): string | null {

    try {

      const parsedUrl =
        new URL(
          url,
        );


      const hostname =
        parsedUrl.hostname
          .toLowerCase();


      if (
        hostname === 'youtu.be' ||
        hostname === 'www.youtu.be'
      ) {

        return (
          parsedUrl.pathname
            .split('/')
            .filter(
              Boolean,
            )[0] ||
          null
        );
      }


      const queryVideoId =
        parsedUrl.searchParams
          .get(
            'v',
          );


      if (
        queryVideoId
      ) {
        return queryVideoId;
      }


      const pathParts =
        parsedUrl.pathname
          .split('/')
          .filter(
            Boolean,
          );


      const embedIndex =
        pathParts.indexOf(
          'embed',
        );


      if (
        embedIndex >= 0 &&
        pathParts[
          embedIndex + 1
        ]
      ) {

        return (
          pathParts[
            embedIndex + 1
          ]
        );
      }


      const shortsIndex =
        pathParts.indexOf(
          'shorts',
        );


      if (
        shortsIndex >= 0 &&
        pathParts[
          shortsIndex + 1
        ]
      ) {

        return (
          pathParts[
            shortsIndex + 1
          ]
        );
      }


      return null;

    } catch {

      return null;
    }
  }


  /* =========================================================
     GOOGLE DRIVE
  ========================================================= */

  private isGoogleDriveUrl(
    url: string,
  ): boolean {

    try {

      const parsedUrl =
        new URL(
          url,
        );


      const hostname =
        parsedUrl.hostname
          .toLowerCase();


      return (
        hostname === 'drive.google.com' ||
        hostname.endsWith(
          '.drive.google.com',
        )
      );

    } catch {

      return false;
    }
  }


  private buildGoogleDriveUrl(
    url: string,
  ): SafeResourceUrl | undefined {

    const fileId =
      this.extractGoogleDriveFileId(
        url,
      );


    if (
      !fileId
    ) {
      return undefined;
    }


    const previewUrl =
      `https://drive.google.com/file/d/${fileId}/preview`;


    return (
      this.sanitizer
        .bypassSecurityTrustResourceUrl(
          previewUrl,
        )
    );
  }


  private extractGoogleDriveFileId(
    url: string,
  ): string | null {

    try {

      const parsedUrl =
        new URL(
          url,
        );


      const idFromQuery =
        parsedUrl.searchParams
          .get(
            'id',
          );


      if (
        idFromQuery
      ) {
        return idFromQuery;
      }


      const filePathMatch =
        parsedUrl.pathname
          .match(
            /\/file\/d\/([^/]+)/,
          );


      if (
        filePathMatch?.[1]
      ) {
        return filePathMatch[1];
      }


      const genericPathMatch =
        parsedUrl.pathname
          .match(
            /\/d\/([^/]+)/,
          );


      return (
        genericPathMatch?.[1] ||
        null
      );

    } catch {

      return null;
    }
  }


  /* =========================================================
     BUTTON STYLE
  ========================================================= */

  getButtonStyle(
    action: ActionButton,
  ): {
    background: string;
    color: string;
    border: string;
  } {

    const background =
      action.color ||
      (
        action.type === 'whatsapp'
          ? '#25D366'
          : '#28336f'
      );


    return {
      background,
      color: '#ffffff',
      border: 'none',
    };
  }
}