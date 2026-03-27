import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImageUploadComponent } from '../../../components/announcements/image-upload/image-upload.component';
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
    ImageUploadComponent,
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
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
      targetRole: UserRole.STUDENT,
      targetStudentType: StudentClassification.TEENS,
      city: 'Portoviejo',
      isActive: true,
      actions: []
    }
  ];

  filterTab: 'all' | 'active' | 'inactive' = 'all';

  // ================= FORM =================
  formImage?: string;
  formTitle: string = '';
  formType: 'promotion' | 'notice' | 'relocation' | null = null;
  formRole: UserRole | null = null;
  formClassification: StudentClassification | null = null;
  formCity: 'Portoviejo' | 'Cuenca' | null = null;
  formIsActive: boolean = true;
  formActions: ActionButton[] = [];
  
  modal: ModalDto = modalInitializer();
  private readonly MODAL_DURATION = 1500;

  // ================= ACTIONS =================
  addAction() {
    this.formActions.push({
      id: crypto.randomUUID(),
      type: 'interest',
      label: ''
    });
  }

  updateAction(event: { id: string; updates: Partial<ActionButton> }) {
    this.formActions = this.formActions.map(a =>
      a.id === event.id ? { ...a, ...event.updates } : a
    );
  }

  removeAction(id: string) {
    this.formActions = this.formActions.filter(a => a.id !== id);
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

  // ================= CREATE =================
  createAnnouncement(payload: Announcement) {
    this.announcements = [payload, ...this.announcements];

    // RESET
    this.formImage = undefined;
    this.formTitle = '';
    this.formType = 'notice';
    this.formRole = null;
    this.formClassification = null;
    this.formCity = null;
    this.formIsActive = true;
    this.formActions = [];
  }

  submitAnnouncement() {

     if (!this.formTitle?.trim()) {
        this.showError('Debes ingresar un título', 1500);
        return;
      }

      if (!this.formType) {
        this.showError('Debes seleccionar un tipo de anuncio', 1500);
        return;
      }
    const payload: Announcement = {
      id: crypto.randomUUID(),
      title: this.formTitle || 'Untitled Announcement',
      type: this.formType,
      imageUrl: this.formImage || '',
      targetRole: this.formRole,
      targetStudentType: this.formClassification,
      city: this.formCity,
      isActive: this.formIsActive,
      actions: this.formActions.map(a => ({
        type: a.type,
        label: a.label,
        url: a.url
      }))
    };

    this.showSuccess('Anuncio creado', 1000);

    console.log('Payload a enviar:', payload);
      this.createAnnouncement(payload);
  }

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
        close: () => {
          this.modal.show = false;
        }
      };

      setTimeout(() => {
        this.modal = { ...this.modal, show: false };
      }, duration);
    }

    showSuccess(message: string, duration = this.MODAL_DURATION) {
      this.modal = {
        ...this.modal,
        show: true,
        message,
        isError: false,
        isSuccess: true,
        isInfo: false,
        title: 'Éxito',
        showButtons: false,
        close: () => {
          this.modal.show = false;
        }
      };

      setTimeout(() => {
        this.modal = { ...this.modal, show: false };
      }, duration);
    }
}