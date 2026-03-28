import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MediaUploadComponent } from '../../../components/announcements/media-upload/media-upload.component';
import { AnnouncementFormComponent } from '../../../components/announcements/announcement-form/announcement-form.component';
import { ActionsBuilderComponent, ActionButton } from '../../../components/announcements/actions-builder/actions-builder.component';
import { PreviewCardComponent } from '../../../components/announcements/preview-card/preview-card.component';
import { AnnouncementsListComponent } from '../../../components/announcements/announcements-list/announcements-list.component';

import { Announcement } from '../../../services/dtos/announcement.dto';
import { StudentClassification } from '../../../services/dtos/student.dto';
import { UserRole } from '../../../services/dtos/user.dto';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { ModalComponent } from '../../../components/modal/modal.component';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [
    CommonModule,
    MediaUploadComponent,
    AnnouncementFormComponent,
    ActionsBuilderComponent,
    PreviewCardComponent,
    AnnouncementsListComponent,
    ModalComponent
  ],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.scss'
})
export class AnnouncementsComponent {

  // ================= MOCK =================
  announcements: Announcement[] = [
    {
      id: '1',
      title: 'Summer Promotion',
      type: 'promotion',
      mediaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
      targetRole: UserRole.STUDENT,
      targetStudentType: StudentClassification.TEENS,
      city: 'Portoviejo',
      isActive: true,
      actions: []
    },
    {
      id: '2',
      title: 'Nuevo horario disponible',
      type: 'notice',
      mediaUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600',
      targetRole: UserRole.STUDENT,
      targetStudentType: StudentClassification.ADULTS,
      city: 'Cuenca',
      isActive: true,
      actions: [
        {
          type: 'action',
          label: 'Ver horarios',
          url: 'https://alcecollege.com/horarios'
        },
        {
          type: 'close',
          label: 'Cerrar'
        }
      ]
    }
  ];

  filterTab: 'all' | 'active' | 'inactive' = 'all';

  // ================= MEDIA =================
  formMedia?: string;
  formMediaType: 'image' | 'video' = 'image';

  // ================= FORM =================
  formTitle: string = '';
  formType: 'promotion' | 'notice' | 'relocation' | null = null;
  formRole: UserRole | null = null;
  formClassification: StudentClassification | null = null;
  formCity: 'Portoviejo' | 'Cuenca' | null = null;
  formIsActive: boolean = true;
  formStartDate?: string;
  formEndDate?: string;

  formActions: ActionButton[] = [
    {
      id: crypto.randomUUID(),
      type: 'action',
      label: 'Más información',
      url: ''
    },
    {
      id: crypto.randomUUID(),
      type: 'close',
      label: 'Cerrar'
    }
  ];

  modal: ModalDto = modalInitializer();
  private readonly MODAL_DURATION = 1500;

  // ================= ACTIONS =================
  addAction(type: 'action' | 'close' | 'whatsapp') {

    const newAction: ActionButton = {
      id: crypto.randomUUID(),
      type,
      label: ''
    };

    if (type === 'whatsapp') {
      newAction.label = 'WhatsApp';
      newAction.color = '#25D366';
    }

    if (type === 'close') {
      newAction.label = 'Cerrar';
    }

    if (type === 'action') {
      newAction.label = '';
      newAction.color = '#28336f';
      newAction.url = '';
    }

    this.formActions.push(newAction);
  }

  updateAction(event: { id: string; updates: Partial<ActionButton> }) {
    this.formActions = this.formActions.map(a =>
      a.id === event.id ? { ...a, ...event.updates } : a
    );
  }

  removeAction(id: string) {
    this.formActions = this.formActions.filter(a => a.id !== id);
  }

  toISODate(date?: string): string | null {
    if (!date) return null;

    const iso = new Date(date + 'T00:00:00').toISOString();

    return iso;
  }

  // ================= CREATE =================
  submitAnnouncement() {

    if (!this.formTitle?.trim()) {
      this.showError('Debes ingresar un título');
      return;
    }

    if (!this.formType) {
      this.showError('Debes seleccionar un tipo de anuncio');
      return;
    }

    const payload: Announcement = {
      id: crypto.randomUUID(),
      title: this.formTitle || 'Untitled Announcement',
      type: this.formType,
      mediaUrl: this.formMedia || '',
      targetRole: this.formRole,
      targetStudentType: this.formClassification,
      city: this.formCity,
      isActive: this.formIsActive,
      startDate: this.toISODate(this.formStartDate),
      endDate: this.toISODate(this.formEndDate),

      actions: this.formActions.map(a => {
        if (a.type === 'close') {
          return {
            type: 'close',
            label: a.label,
            color: a.color
          };
        }

        if (a.type === 'whatsapp') {
          return {
            type: 'whatsapp',
            label: a.label,
            url: this.buildWhatsappUrl(a.url),
            color: a.color
          };
        }

        return {
          type: 'action',
          label: a.label,
          url: a.url || '',
          color: a.color
        };
      })
    };

    console.log('Payload:', payload);
    this.showSuccess('Anuncio creado');
    this.createAnnouncement(payload);
  }

  // ================= WHATSAPP =================
  buildWhatsappUrl(value?: string): string {
    if (!value) return '';

    let phone = value.replace(/\D/g, '');

    // Ecuador por defecto
    if (!phone.startsWith('593')) {
      if (phone.startsWith('0')) {
        phone = '593' + phone.substring(1);
      } else {
        phone = '593' + phone;
      }
    }

    return `https://wa.me/${phone}`;
  }

  createAnnouncement(payload: Announcement) {
    this.announcements = [payload, ...this.announcements];

    this.formMedia = undefined;
    this.formTitle = '';
    this.formActions = [
      {
        id: crypto.randomUUID(),
        type: 'action',
        label: 'Más información',
        url: ''
      },
      {
        id: crypto.randomUUID(),
        type: 'close',
        label: 'Cerrar'
      }
    ];

  }

  // ================= MODAL =================
  showError(message: string, duration = this.MODAL_DURATION) {
    this.modal = {
      ...this.modal,
      show: true,
      message,

      isError: true,
      isSuccess: false,
      isInfo: false, 

      title: 'Error',
      showButtons: false,
      close: () => this.modal.show = false
    };

    setTimeout(() => this.modal.show = false, duration);
  }

  showSuccess(message: string, duration = this.MODAL_DURATION) {
    this.modal = {
      ...this.modal,
      show: true,
      message,

      isSuccess: true,
      isError: false,
      isInfo: false,

      title: 'Éxito',
      showButtons: false,
      close: () => this.modal.show = false
    };

    setTimeout(() => this.modal.show = false, duration);
  }

  // ================= LIST =================
  toggleAnnouncement(id: string) {
    this.announcements = this.announcements.map(a =>
      a.id === id ? { ...a, isActive: !a.isActive } : a
    );
  }

  deleteAnnouncement(id: string) {
    this.announcements = this.announcements.filter(a => a.id !== id);
  }
}