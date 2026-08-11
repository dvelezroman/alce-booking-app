import {
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  Notification,
} from '../../../../services/dtos/notification.dto';

type NotificationAttachment = {
  name: string;
  url: string;
  type?: string;
  size?: number;
};

@Component({
  selector: 'app-notification-detail-attachments',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl:
    './notification-detail-attachments.component.html',
  styleUrls: [
    './notification-detail-attachments.component.scss',
  ],
})
export class NotificationDetailAttachmentsComponent {

  @Input({ required: true })
  notification!: Notification;

  get attachments(): NotificationAttachment[] {

    const notificationData =

      this.notification as unknown as {

        attachments?: unknown[];

        message?: {

          attachments?: unknown[];

        };

      };

    const rawAttachments =

      notificationData.attachments ??

      notificationData.message?.attachments ??

      [];

    if (!Array.isArray(rawAttachments)) {

      return [];

    }

    return rawAttachments.flatMap(

      (attachment): NotificationAttachment[] => {

        if (

          !attachment ||

          typeof attachment !== 'object'

        ) {

          return [];

        }

        const item = attachment as {

          name?: unknown;

          fileName?: unknown;

          filename?: unknown;

          url?: unknown;

          fileUrl?: unknown;

          type?: unknown;

          mimeType?: unknown;

          size?: unknown;

        };

        const url =

          typeof item.url === 'string'

            ? item.url

            : typeof item.fileUrl === 'string'

              ? item.fileUrl

              : '';

        if (!url) {

          return [];

        }

        const name =

          typeof item.name === 'string'

            ? item.name

            : typeof item.fileName === 'string'

              ? item.fileName

              : typeof item.filename === 'string'

                ? item.filename

                : this.getFileNameFromUrl(url);

        const attachmentData: NotificationAttachment = {

          name,

          url,

        };

        if (typeof item.type === 'string') {

          attachmentData.type = item.type;

        } else if (

          typeof item.mimeType === 'string'

        ) {

          attachmentData.type =

            item.mimeType;

        }

        if (typeof item.size === 'number') {

          attachmentData.size = item.size;

        }

        return [attachmentData];

      },

    );

  }

  get hasAttachments(): boolean {
    return this.attachments.length > 0;
  }

  getFileIcon(
    attachment: {
      name: string;
      type?: string;
    },
  ): string {
    const name =
      attachment.name.toLowerCase();

    const type =
      attachment.type?.toLowerCase() ??
      '';

    if (
      type.includes('pdf') ||
      name.endsWith('.pdf')
    ) {
      return 'pi-file-pdf';
    }

    if (
      type.includes('image') ||
      /\.(png|jpe?g|webp|gif|svg)$/.test(
        name,
      )
    ) {
      return 'pi-image';
    }

    if (
      type.includes('word') ||
      /\.(doc|docx)$/.test(name)
    ) {
      return 'pi-file-word';
    }

    if (
      type.includes('sheet') ||
      type.includes('excel') ||
      /\.(xls|xlsx|csv)$/.test(name)
    ) {
      return 'pi-file-excel';
    }

    return 'pi-file';
  }

  formatFileSize(
    size?: number,
  ): string {
    if (
      size == null ||
      !Number.isFinite(size) ||
      size <= 0
    ) {
      return '';
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  openAttachment(
    url: string,
  ): void {
    if (
      !url ||
      typeof window === 'undefined'
    ) {
      return;
    }

    window.open(
      url,
      '_blank',
      'noopener,noreferrer',
    );
  }

  trackByAttachment(
    index: number,
    attachment: {
      name: string;
      url: string;
    },
  ): string {
    return `${attachment.url}-${index}`;
  }

  private getFileNameFromUrl(
    url: string,
  ): string {
    try {
      const parsedUrl =
        new URL(url);

      const lastSegment =
        parsedUrl.pathname
          .split('/')
          .filter(Boolean)
          .pop();

      return lastSegment
        ? decodeURIComponent(lastSegment)
        : 'Archivo adjunto';
    } catch {
      const cleanUrl =
        url.split('?')[0];

      const lastSegment =
        cleanUrl
          .split('/')
          .filter(Boolean)
          .pop();

      return lastSegment
        ? decodeURIComponent(lastSegment)
        : 'Archivo adjunto';
    }
  }
}