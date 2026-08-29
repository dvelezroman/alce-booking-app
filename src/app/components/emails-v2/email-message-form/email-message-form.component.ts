import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UserDto } from '../../../services/dtos/user.dto';
import { Stage } from '../../../services/dtos/student.dto';
import { NotificationGroupDto } from '../../../services/dtos/notification.dto';

import {
  BulkEmailRecipient,
  SendBulkEmailRequest,
  SendEmailRequest,
  SendTemplateEmailRequest,
} from '../../../services/dtos/email.dto';

export type EmailMessageRecipientType =
  | 'user'
  | 'stage'
  | 'group'
  | 'role';

type EmailMode =
  | 'manual'
  | 'template';

@Component({
  selector: 'app-email-message-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './email-message-form.component.html',
  styleUrl: './email-message-form.component.scss',
})
export class EmailMessageFormComponent implements OnChanges {

  /* =========================
     EDITOR
  ========================= */

  @ViewChild('emailEditor')
  emailEditor?: ElementRef<HTMLDivElement>;

  /* =========================
     INPUTS
  ========================= */

  @Input() selectedType: EmailMessageRecipientType | '' = 'user';

  @Input() selectedUser: UserDto | null = null;
  @Input() externalEmail: string | null = null;

  @Input() selectedStage: Stage | null = null;

  @Input() stageUsers: UserDto[] = [];

  @Input() selectedRole:
    | 'student'
    | 'instructor'
    | 'admin'
    | null = null;

  @Input() roleUsers: UserDto[] = [];

  @Input() selectedGroup: NotificationGroupDto | null = null;

  @Input() reset = false;

  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  submitBulkEmail =
    new EventEmitter<SendBulkEmailRequest>();

  @Output()
  submitSingleEmail =
    new EventEmitter<SendEmailRequest>();

  @Output()
  submitTemplateEmail =
    new EventEmitter<SendTemplateEmailRequest>();

  @Output()
  invalidSingleEmail =
    new EventEmitter<UserDto>();

  /* =========================
     STATE
  ========================= */

  mode: EmailMode = 'manual';

  subject = '';
  content = '';

  templateName = '';

  templateNames: string[] = [
    'welcome',
    'reminder',
    'notification',
  ];

  isBoldActive = false;
  isItalicActive = false;
  isUnderlineActive = false;
  isListActive = false;

  /* =========================
     CHANGES
  ========================= */

  ngOnChanges(
    changes: SimpleChanges,
  ): void {

    if (
      changes['reset'] &&
      this.reset
    ) {
      this.resetForm();
    }
  }

  /* =========================
     MODE
  ========================= */

  selectMode(
    mode: EmailMode,
  ): void {
    this.mode = mode;
  }

  /* =========================
     EDITOR FORMAT
  ========================= */

  formatText(
    command:
      | 'bold'
      | 'italic'
      | 'underline',
  ): void {

    this.focusEditor();

    document.execCommand(
      command,
      false,
    );

    this.updateToolbarState();
    this.syncEditorContent();
  }

  /* =========================
     BULLET LIST
  ========================= */

  toggleBulletList(): void {

    const editor =
      this.emailEditor
        ?.nativeElement;

    if (!editor) {
      return;
    }

    editor.focus();

    document.execCommand(
      'insertText',
      false,
      '• ',
    );

    this.syncEditorContent();
  }

  updateToolbarState(): void {

    this.isBoldActive =
      document.queryCommandState(
        'bold',
      );

    this.isItalicActive =
      document.queryCommandState(
        'italic',
      );

    this.isUnderlineActive =
      document.queryCommandState(
        'underline',
      );

    this.isListActive =
      document.queryCommandState(
        'insertUnorderedList',
      );
  }

  onEditorSelectionChange(): void {
    this.updateToolbarState();
  }

  /* =========================
     LINK
  ========================= */

  insertLink(): void {

    const selection =
      window.getSelection();

    if (
      !selection ||
      selection.rangeCount === 0
    ) {
      return;
    }

    const selectedText =
      selection
        .toString()
        .trim();

    if (!selectedText) {
      return;
    }

    const url =
      window.prompt(
        'Ingresa la URL del enlace:',
        'https://',
      );

    if (!url?.trim()) {
      return;
    }

    this.focusEditor();

    document.execCommand(
      'createLink',
      false,
      url.trim(),
    );

    this.syncEditorContent();
  }

  /* =========================
     EDITOR INPUT
  ========================= */

  onEditorInput(): void {
    this.syncEditorContent();
  }

  /* =========================
     EDITOR CONTENT
  ========================= */

  private syncEditorContent(): void {

    if (!this.emailEditor) {
      return;
    }

    this.content =
      this.emailEditor
        .nativeElement
        .innerHTML
        .trim();
  }

  private focusEditor(): void {

    this.emailEditor
      ?.nativeElement
      .focus();
  }

  /* =========================
     VALIDATION
  ========================= */

  get canSubmit(): boolean {

    if (!this.selectedType) {
      return false;
    }

    if (
      this.selectedType === 'user' &&
      !this.hasValidSingleRecipient
    ) {
      return false;
    }

    if (
      this.mode === 'template'
    ) {
      return (
        this.templateName
          .trim()
          .length > 0
      );
    }

    return (
      this.subject
        .trim()
        .length > 0 &&
      this.hasEditorContent
    );
  }

  get hasValidSingleRecipient(): boolean {

    if (
      this.externalEmail &&
      this.isValidEmail(
        this.externalEmail,
      )
    ) {
      return true;
    }

    if (!this.selectedUser) {
      return false;
    }

    return Boolean(
      this.getUserValidEmail(
        this.selectedUser,
      ),
    );
  }

  get hasEditorContent(): boolean {

    if (!this.content.trim()) {
      return false;
    }

    const temp =
      document.createElement(
        'div',
      );

    temp.innerHTML =
      this.content;

    return (
      temp.textContent
        ?.trim()
        .length ?? 0
    ) > 0;
  }

  /* =========================
     SUBMIT
  ========================= */

onSubmit(): void {
  this.syncEditorContent();

  console.log('EMAIL FORM SUBMIT:', {
    selectedType: this.selectedType,
    selectedRole: this.selectedRole,
    roleUsers: this.roleUsers.length,
    stageUsers: this.stageUsers.length,
    groupUsers: this.selectedGroup?.users?.length ?? 0,
    subject: this.subject,
    content: this.content,
    hasEditorContent: this.hasEditorContent,
    canSubmit: this.canSubmit,
    mode: this.mode,
  });

  if (!this.canSubmit) {
    console.warn('El formulario no puede enviarse porque canSubmit = false');
    return;
  }

  if (this.selectedType === 'user') {
    this.submitUserEmail();
    return;
  }

  if (this.mode === 'template') {
    return;
  }

  this.submitBulk();
}

  /* =========================
     SINGLE USER
  ========================= */

  private submitUserEmail(): void {

    const externalEmail =
      this.externalEmail
        ?.trim() ?? '';

    const isExternalRecipient =
      this.isValidEmail(
        externalEmail,
      );


    /* =========================
      EXTERNAL EMAIL
    ========================= */

    if (isExternalRecipient) {

      if (
        this.mode ===
        'template'
      ) {

        const payload:
          SendTemplateEmailRequest = {

          to: externalEmail,

          templateName:
            this.templateName
              .trim(),

          variables: {
            firstName: '',
            lastName: '',
            email:
              externalEmail,
          },

          fromName:
            'Alce College',
        };

        this.submitTemplateEmail.emit(
          payload,
        );

        return;
      }


      const payload:
        SendEmailRequest = {

        to: externalEmail,

        subject:
          this.subject
            .trim(),

        content:
          this.content
            .trim(),

        contentType:
          'html',

        fromName:
          'Alce College',
      };

      this.submitSingleEmail.emit(
        payload,
      );

      return;
    }


    /* =========================
      PLATFORM USER
    ========================= */

    if (!this.selectedUser) {
      return;
    }

    const email =
      this.getUserValidEmail(
        this.selectedUser,
      );

    if (!email) {

      this.invalidSingleEmail.emit(
        this.selectedUser,
      );

      return;
    }


    /* TEMPLATE */

    if (
      this.mode ===
      'template'
    ) {

      const payload:
        SendTemplateEmailRequest = {

        to: email,

        templateName:
          this.templateName
            .trim(),

        variables: {
          firstName:
            this.selectedUser
              .firstName ?? '',

          lastName:
            this.selectedUser
              .lastName ?? '',

          email,
        },

        fromName:
          'Alce College',
      };

      this.submitTemplateEmail.emit(
        payload,
      );

      return;
    }


    /* MANUAL */

    const payload:
      SendEmailRequest = {

      to: email,

      subject:
        this.subject
          .trim(),

      content:
        this.content
          .trim(),

      contentType:
        'html',

      fromName:
        'Alce College',
    };

    this.submitSingleEmail.emit(
      payload,
    );
  }

  /* =========================
     BULK
  ========================= */

  private submitBulk(): void {
    const recipients =
      this.getBulkRecipients();

    // console.log('BULK GENERADO:', {
    //   selectedType: this.selectedType,
    //   roleUsers: this.roleUsers.length,
    //   stageUsers: this.stageUsers.length,
    //   recipients: recipients.length,
    //   recipientsData: recipients,
    // });

    if (!recipients.length) {
      console.warn(
        'No existen destinatarios válidos para el bulk.',
      );
      return;
    }

    const payload: SendBulkEmailRequest = {
      recipients,
      subject: this.subject.trim(),
      content: this.content.trim(),
      contentType: 'html',
      fromName: 'Alce College',
    };

    console.log(
      'BULK PAYLOAD EMITIDO:',
      payload,
    );

    this.submitBulkEmail.emit(payload);
  }

  /* =========================
     BULK RECIPIENTS
  ========================= */

  private getBulkRecipients(): BulkEmailRecipient[] {

    if (this.selectedType === 'group') {
      const users =
        this.selectedGroup?.users ?? [];

      return this.mapUsersToRecipients(
        users,
      );
    }

    if (this.selectedType === 'stage') {
      return this.mapUsersToRecipients(
        this.stageUsers,
      );
    }

    if (this.selectedType === 'role') {
      return this.mapUsersToRecipients(
        this.roleUsers,
      );
    }

    return [];
  }

  /* =========================
     USERS -> RECIPIENTS
  ========================= */

  private mapUsersToRecipients(
    users: UserDto[],
  ): BulkEmailRecipient[] {

    return users
      .map(user => {

        const email =
          this.getUserValidEmail(
            user,
          );

        if (!email) {
          return null;
        }

        return {
          to: email,
          name:
            this.getUserName(
              user,
            ),
        };
      })
      .filter(
        (
          recipient,
        ): recipient is BulkEmailRecipient =>
          recipient !== null,
      );
  }

  /* =========================
     EMAIL
  ========================= */

  private getUserValidEmail(
    user: UserDto,
  ): string | null {

    const tutorEmail =
      user.student
        ?.tutorEmail
        ?.trim();

    if (
      tutorEmail &&
      this.isValidEmail(
        tutorEmail,
      )
    ) {
      return tutorEmail;
    }

    const emailAddress =
      user.emailAddress
        ?.trim();

    if (
      emailAddress &&
      this.isValidEmail(
        emailAddress,
      )
    ) {
      return emailAddress;
    }

    const email =
      user.email
        ?.trim();

    if (
      email &&
      this.isValidEmail(
        email,
      )
    ) {
      return email;
    }

    return null;
  }

  private isValidEmail(
    email?: string | null,
  ): boolean {

    if (!email?.trim()) {
      return false;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(
        email.trim(),
      );
  }

  /* =========================
     SUMMARY
  ========================= */

  get recipientLabel(): string {

    switch (
      this.selectedType
    ) {

      case 'user':
        if (
          this.externalEmail &&
          this.isValidEmail(
            this.externalEmail,
          )
        ) {
          return this.externalEmail;
        }

        return this.selectedUser
          ? this.getUserName(
              this.selectedUser,
            )
          : 'Sin destinatario';

      case 'stage':
        return (
          this.selectedStage
            ?.description ||
          'Stage no seleccionado'
        );

      case 'group':
        return (
          this.selectedGroup
            ?.name ||
          'Grupo no seleccionado'
        );

      case 'role':
        return this.getRoleLabel();

      default:
        return 'Sin destinatario';
    }
  }

  get recipientTypeLabel(): string {

    switch (
      this.selectedType
    ) {

      case 'user':
      return (
        this.externalEmail &&
        this.isValidEmail(
          this.externalEmail,
        )
      )
        ? 'Correo externo'
        : 'Usuario individual';

      case 'stage':
        return 'Stage';

      case 'group':
        return 'Grupo';

      case 'role':
        return 'Rol';

      default:
        return '—';
    }
  }

  /* =========================
     ROLE
  ========================= */

  private getRoleLabel(): string {

    switch (
      this.selectedRole
    ) {

      case 'student':
        return 'Estudiantes';

      case 'instructor':
        return 'Instructores';

      case 'admin':
        return 'Administradores';

      default:
        return 'Rol no seleccionado';
    }
  }

  /* =========================
     USER HELPERS
  ========================= */

  getUserName(
    user: UserDto,
  ): string {

    const fullName =
      [
        user.firstName,
        user.lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

    return (
      fullName ||
      user.emailAddress ||
      user.email ||
      'Usuario'
    );
  }

  /* =========================
     CLEAR
  ========================= */

  clearContent(): void {

    this.subject = '';
    this.content = '';
    this.templateName = '';

    this.clearEditor();
  }

  private resetForm(): void {

    this.mode = 'manual';

    this.subject = '';
    this.content = '';
    this.templateName = '';

    this.isBoldActive = false;
    this.isItalicActive = false;
    this.isUnderlineActive = false;
    this.isListActive = false;

    this.clearEditor();
  }

  private clearEditor(): void {

    setTimeout(
      () => {
        if (
          this.emailEditor
        ) {
          this.emailEditor
            .nativeElement
            .innerHTML = '';
        }
      },
      0,
    );
  }
}