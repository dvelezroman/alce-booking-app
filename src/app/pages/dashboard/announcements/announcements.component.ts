import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaUploadComponent } from '../../../components/announcements/media-upload/media-upload.component';
import { AnnouncementFormComponent } from '../../../components/announcements/announcement-form/announcement-form.component';
import { ActionsBuilderComponent, ActionButton } from '../../../components/announcements/actions-builder/actions-builder.component';
import { PreviewCardComponent } from '../../../components/announcements/preview-card/preview-card.component';
import { AnnouncementsListComponent } from '../../../components/announcements/announcements-list/announcements-list.component';
import { Announcement } from '../../../services/dtos/announcement.dto';
import { StudentClassification } from '../../../services/dtos/student.dto';
import { UserRole } from '../../../services/dtos/user.dto';
import { AnnouncementService } from '../../../services/announcement.service';
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
export class AnnouncementsComponent implements OnInit {

  constructor(private announcementService: AnnouncementService) {}

  // ================= DATA =================
  announcements: Announcement[] = [];

  filterTab: 'all' | 'active' | 'inactive' = 'all';

  // ================= MEDIA =================
  formMedia?: string;
  originalMedia?: string;
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

  formShowMode: 'always' | 'once_session' = 'always';
  formAspectRatio: 'horizontal' | 'vertical' | 'square' = 'horizontal';

  // ================= editar anuncio =================
  editingAnnouncement: Announcement | null = null;

  // ================= confirmación para eliminar anuncio =================
  pendingDeleteId: string | null = null;

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

  // ================= INIT =================
  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements() {
    this.announcementService.getAllAnnouncements().subscribe({
      next: (res) => {
        this.announcements = res;
      },
      error: (err) => {
        console.error('Error cargando anuncios', err);
      }
    });
  }

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

    this.formActions = [...this.formActions, newAction];
  }

  updateAction(event: { id: string; updates: Partial<ActionButton> }) {
    this.formActions = this.formActions.map(a =>
      a.id === event.id ? { ...a, ...event.updates } : a
    );
  }

  removeAction(id: string) {
    this.formActions = this.formActions.filter(a => a.id !== id);
  }

  // ================= HELPERS =================
  toISODate(date?: string): string | null {
    if (!date) return null;
    return new Date(date + 'T00:00:00').toISOString();
  }

  buildWhatsappUrl(value?: string): string {
    if (!value) return '';

    let phone = value.replace(/\D/g, '');

    if (!phone.startsWith('593')) {
      if (phone.startsWith('0')) {
        phone = '593' + phone.substring(1);
      } else {
        phone = '593' + phone;
      }
    }

    return `https://wa.me/${phone}`;
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
      title: this.formTitle,
      type: this.formType,
      mediaUrl: this.formMedia || '',
      targetRole: this.formRole,
      targetStudentType: this.formClassification,
      city: this.formCity,
      isActive: this.formIsActive,
      startDate: this.toISODate(this.formStartDate),
      endDate: this.toISODate(this.formEndDate),
      showMode: this.formShowMode,
      aspectRatio: this.formAspectRatio,

      actions: this.formActions.map(a => ({
        type: a.type,
        label: a.label,
        url: a.type === 'whatsapp' ? this.buildWhatsappUrl(a.url) : a.url,
        color: a.color,
        delaySeconds: a.delaySeconds
      }))
    };

    this.announcementService.createAnnouncement(payload).subscribe({
      next: (res) => {
        this.announcements = [res, ...this.announcements];
        this.showSuccess('Anuncio creado');
        this.resetForm();
      },
      error: (err) => {
        console.error(err);
        this.showError('Error al crear anuncio');
      }
    });
  }


  // ================= UPDATE =================
  updateAnnouncement() {

    if (!this.editingAnnouncement) return;

    const id = this.editingAnnouncement.id;

    const payload: any = {
      title: this.formTitle,
      type: this.formType,
      targetRole: this.formRole,
      targetStudentType: this.formClassification,
      city: this.formCity,
      isActive: this.formIsActive,
      startDate: this.toISODate(this.formStartDate),
      endDate: this.toISODate(this.formEndDate),
      showMode: this.formShowMode,
      aspectRatio: this.formAspectRatio,
      actions: this.formActions.map(a => ({
        type: a.type,
        label: a.label,
        url: a.url,
        color: a.color,
        delaySeconds: a.delaySeconds
      }))
    };

    // SOLO SI CAMBIA MEDIA
    if (this.formMedia) {
      payload.mediaUrl = this.formMedia;
    }

    this.announcementService.updateAnnouncement(id, payload).subscribe({
      next: (updated) => {

        this.announcements = this.announcements.map(a =>
          a.id === id ? updated : a
        );

        this.showSuccess('Actualizado');
        this.cancelEdit();
      },
      error: () => this.showError('Error al actualizar')
    });
  }

  editAnnouncement(a: Announcement) {

    this.formMedia = undefined;
    this.originalMedia = a.mediaUrl;
    this.editingAnnouncement = a;

    this.formTitle = a.title || '';
    this.formType = a.type;

    this.formRole = a.targetRole;
    this.formClassification = a.targetStudentType || null;
    this.formCity = a.city || null;

    this.formIsActive = a.isActive;

    this.formStartDate = a.startDate ? a.startDate.split('T')[0] : undefined;
    this.formEndDate = a.endDate ? a.endDate.split('T')[0] : undefined;

    this.formShowMode = a.showMode || 'always';
    this.formAspectRatio = a.aspectRatio === 'vertical' || a.aspectRatio === 'square' ? a.aspectRatio : 'horizontal';

    this.formActions = a.actions.map(action => ({
      id: crypto.randomUUID(),
      type: action.type,
      label: action.label,
      url: action.url,
      color: action.color,
      delaySeconds: action.delaySeconds
    }));
  }

  cancelEdit() {
    this.editingAnnouncement = null;

    // limpiar formulario
    this.formTitle = '';
    this.formType = null;
    this.formRole = null;
    this.formClassification = null;
    this.formCity = null;
    this.formIsActive = true;

    this.formStartDate = undefined;
    this.formEndDate = undefined;

    this.formShowMode = 'always';
    this.formAspectRatio = 'horizontal';

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

    this.formMedia = undefined;
    this.originalMedia = undefined;
  }
  

  resetForm() {
    this.formMedia = undefined;
    this.originalMedia = undefined;
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
    this.formShowMode = 'always';
  }

  // ================= DELETE =================
  confirmDelete(id: string) {

    this.pendingDeleteId = id;

    this.modal = {
      ...this.modal,
      show: true,
      message: '¿Seguro que deseas eliminar este anuncio?',
      isError: false,
      isSuccess: false,
      isInfo: true,

      showButtons: true,

      close: () => this.closeDeleteModal(),
      confirm: () => this.executeDelete()
    };
  }

  executeDelete() {
    if (!this.pendingDeleteId) return;

    const id = this.pendingDeleteId;

    this.announcementService.deleteAnnouncement(this.pendingDeleteId).subscribe({
      next: () => {
        this.announcements = this.announcements.filter(
          a => a.id !== this.pendingDeleteId
        );

        this.showSuccess('Eliminado');
        this.pendingDeleteId = null;
      },
      error: (err) => {
        console.error(err);
        this.showError('Error al eliminar');
      }
    });

    this.closeDeleteModal();
  }

  closeDeleteModal() {
    this.modal.show = false;
    this.pendingDeleteId = null;
  }

  // ================= TOGGLE =================
  toggleAnnouncement(id: string) {

    const current = this.announcements.find(a => a.id === id);
    if (!current) return;

    this.announcementService.updateAnnouncement(id, {
      isActive: !current.isActive
    }).subscribe({
      next: (updated) => {
        this.announcements = this.announcements.map(a =>
          a.id === id ? updated : a
        );
      },
      error: (err) => {
        console.error(err);
        this.showError('Error al actualizar');
      }
    });
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

  
}