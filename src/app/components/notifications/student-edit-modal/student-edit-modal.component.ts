import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CreateStudentWithUserDto, NewStudentRow } from '../../../services/dtos/notification.dto';
import { Stage } from '../../../services/dtos/student.dto';

type StudentClassification = 'KIDS' | 'TEENS' | 'ADULTS';

@Component({
  selector: 'app-student-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-edit-modal.component.html',
  styleUrls: ['./student-edit-modal.component.scss'],
})
export class StudentEditModalComponent implements OnChanges {
  @Input() show = false;
  @Input() student: NewStudentRow | null = null;
  @Input() stages: Stage[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<CreateStudentWithUserDto>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      // Control interno de la fila
      index: [null],

      // Datos mínimos obligatorios para crear usuario + estudiante
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      mode: ['', Validators.required],
      studentClassification: ['', Validators.required],

      // Datos personales / contacto
      idNumber: [''],
      birthday: [''],
      emailAddress: ['', Validators.email],
      contact: [''],
      country: [''],
      city: [''],
      occupation: [''],

      // Datos académicos
      stageId: [null],
      stageLabel: [''],
      startClassDate: [''],
      endClassDate: [''],

      // Datos de representante, solo menores
      tutorName: [''],
      tutorEmail: [''],
      tutorPhone: [''],

      // Datos de contrato / programación
      contractNumber: [''],
      maxSchedulingStage: [null],

      // Datos opcionales de programa
      contractProgramType: [''],
      contractProgramLabel: [''],
      studyProgramName: [''],
      studyProgramCode: [''],
      studyProgramDurationMonths: [null],
      studyProgramDurationLabel: [''],
      studyProgramComment: [''],
    });

    this.listenClassificationChanges();
    this.listenBirthdayChanges();
  }

  /**
   * Actualiza el formulario cuando cambia el estudiante seleccionado
   * o cuando llegan los stages desde el padre.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['student'] || changes['stages']) && this.student) {
      this.patchStudentForm(this.student);
    }
  }

  /**
   * Indica si debe mostrarse la sección del representante.
   * Se muestra para KIDS, TEENS o cuando la fecha de nacimiento indica menor de edad.
   */
  get shouldShowTutorField(): boolean {
    const classification = this.form.get('studentClassification')?.value as StudentClassification;
    return classification === 'KIDS' || classification === 'TEENS' || this.isMinorByBirthday();
  }

  /**
   * Valores iniciales del formulario.
   * Sirve para limpiar campos que el estudiante no trae, como password,
   * tutorEmail, tutorPhone, contractNumber, etc.
   */
  private getInitialFormValue() {
    return {
      index: null,

      email: '',
      password: '',
      firstName: '',
      lastName: '',
      mode: '',
      studentClassification: '',

      idNumber: '',
      birthday: '',
      emailAddress: '',
      contact: '',
      country: '',
      city: '',
      occupation: '',

      stageId: null,
      stageLabel: '',
      startClassDate: '',
      endClassDate: '',

      tutorName: '',
      tutorEmail: '',
      tutorPhone: '',

      contractNumber: '',
      maxSchedulingStage: null,

      contractProgramType: '',
      contractProgramLabel: '',
      studyProgramName: '',
      studyProgramCode: '',
      studyProgramDurationMonths: null,
      studyProgramDurationLabel: '',
      studyProgramComment: '',
    };
  }

  /**
   * Limpia completamente el formulario y sus estados visuales.
   */
  private resetForm(): void {
    this.form.reset(this.getInitialFormValue(), { emitEvent: false });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.applyConditionalValidators();
  }

  /**
   * Carga los datos del estudiante en el formulario.
   */
  private patchStudentForm(student: NewStudentRow): void {
    this.resetForm();

    const stage = this.stages.find(
      (s) => Number(s.id) === Number(student.stageId)
    );

    this.form.patchValue(
      {
        ...student,
        stageId: stage ? stage.id : student.stageId,
        stageLabel: stage
          ? `STG ${stage.number} — ${stage.description || `Stage ${stage.number}`}`
          : student.stageLabel,
        birthday: this.formatDateForInput((student as any).birthday),
        startClassDate: this.formatDateForInput(student.startClassDate),
        endClassDate: this.formatDateForInput((student as any).endClassDate),
        tutorName: student.tutorName === '—' ? '' : student.tutorName,
        tutorEmail: (student as any).tutorEmail || '',
        tutorPhone: (student as any).tutorPhone || '',
      },
      { emitEvent: false }
    );

    this.applyConditionalValidators();
  }

  /**
   * Escucha cambios en la clasificación del estudiante.
   * Si cambia a ADULTS, limpia datos del representante.
   */
  private listenClassificationChanges(): void {
    this.form
      .get('studentClassification')
      ?.valueChanges.subscribe((classification: StudentClassification) => {
        if (classification === 'ADULTS') {
          this.clearTutorFields();
        }

        this.applyConditionalValidators();
      });
  }

  /**
   * Escucha cambios en birthday para validar si el estudiante es menor.
   */
  private listenBirthdayChanges(): void {
    this.form.get('birthday')?.valueChanges.subscribe(() => {
      this.applyConditionalValidators();
    });
  }

  /**
   * Aplica validaciones condicionales según backend:
   * - KIDS requiere birthday.
   * - Menores requieren tutorName, tutorEmail y tutorPhone.
   */
  private applyConditionalValidators(): void {
    const classification = this.form.get('studentClassification')?.value as StudentClassification;

    const birthdayControl = this.form.get('birthday');
    const tutorNameControl = this.form.get('tutorName');
    const tutorEmailControl = this.form.get('tutorEmail');
    const tutorPhoneControl = this.form.get('tutorPhone');

    if (!birthdayControl || !tutorNameControl || !tutorEmailControl || !tutorPhoneControl) {
      return;
    }

    // Birthday obligatorio solo para KIDS según regla del backend
    if (classification === 'KIDS') {
      birthdayControl.setValidators([Validators.required]);
    } else {
      birthdayControl.clearValidators();
    }

    const requiresTutor =
      classification === 'KIDS' ||
      classification === 'TEENS' ||
      this.isMinorByBirthday();

    if (requiresTutor) {
      tutorNameControl.setValidators([Validators.required]);
      tutorEmailControl.setValidators([Validators.required, Validators.email]);
      tutorPhoneControl.setValidators([Validators.required]);
    } else {
      tutorNameControl.clearValidators();
      tutorEmailControl.clearValidators();
      tutorPhoneControl.clearValidators();

      if (classification === 'ADULTS') {
        this.clearTutorFields();
      }
    }

    birthdayControl.updateValueAndValidity({ emitEvent: false });
    tutorNameControl.updateValueAndValidity({ emitEvent: false });
    tutorEmailControl.updateValueAndValidity({ emitEvent: false });
    tutorPhoneControl.updateValueAndValidity({ emitEvent: false });
  }

  /**
   * Actualiza stageId y stageLabel cuando el usuario cambia el stage.
   */
  onStageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const id = Number(select.value);

    const stage = this.stages.find((s) => Number(s.id) === id);

    this.form.patchValue({
      stageId: id || null,
      stageLabel: stage
        ? `STG ${stage.number} — ${stage.description || `Stage ${stage.number}`}`
        : '',
    });
  }

  /**
   * Envía al padre el payload listo para crear el estudiante.
   */
  onSubmit(): void {
    this.applyConditionalValidators();

    if (this.form.invalid || !this.student) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const isAdult = value.studentClassification === 'ADULTS';

    const payload: CreateStudentWithUserDto = {
      email: this.cleanText(value.email),
      password: this.cleanText(value.password),

      firstName: this.cleanText(value.firstName),
      lastName: this.cleanText(value.lastName),

      idNumber: this.cleanOptionalText(value.idNumber),
      birthday: this.toIsoDateOrEmpty(value.birthday),

      emailAddress: this.cleanOptionalText(value.emailAddress),
      contact: this.cleanOptionalText(value.contact),
      country: this.cleanOptionalText(value.country),
      city: this.cleanOptionalText(value.city),
      occupation: this.cleanOptionalText(value.occupation),

      mode: value.mode,
      stageId: value.stageId ? Number(value.stageId) : undefined,
      studentClassification: value.studentClassification,

      startClassDate: this.toIsoDateOrEmpty(value.startClassDate),
      endClassDate: this.toIsoDateOrEmpty(value.endClassDate),

      tutorName: isAdult ? undefined : this.cleanOptionalText(value.tutorName),
      tutorEmail: isAdult ? undefined : this.cleanOptionalText(value.tutorEmail),
      tutorPhone: isAdult ? undefined : this.cleanOptionalText(value.tutorPhone),

      contractNumber: this.cleanOptionalText(value.contractNumber),
      maxSchedulingStage: value.maxSchedulingStage
        ? Number(value.maxSchedulingStage)
        : undefined,

      contractProgramType: this.cleanOptionalText(value.contractProgramType),
      contractProgramLabel: this.cleanOptionalText(value.contractProgramLabel),
      studyProgramName: this.cleanOptionalText(value.studyProgramName),
      studyProgramCode: this.cleanOptionalText(value.studyProgramCode),
      studyProgramDurationMonths: value.studyProgramDurationMonths
        ? Number(value.studyProgramDurationMonths)
        : undefined,
      studyProgramDurationLabel: this.cleanOptionalText(value.studyProgramDurationLabel),
      studyProgramComment: this.cleanOptionalText(value.studyProgramComment),
    };

    this.create.emit(payload);
    this.resetForm();
  }

  /**
   * Cierra el modal sin guardar cambios.
   */
  onClose(): void {
    this.resetForm();
    this.close.emit();
  }

  /**
   * Limpia los campos del representante.
   */
  private clearTutorFields(): void {
    this.form.patchValue(
      {
        tutorName: '',
        tutorEmail: '',
        tutorPhone: '',
      },
      { emitEvent: false }
    );
  }

  /**
   * Retorna true si el birthday indica que el estudiante tiene menos de 18 años.
   */
  private isMinorByBirthday(): boolean {
    const birthday = this.form.get('birthday')?.value;
    if (!birthday) return false;

    const birthDate = new Date(birthday);
    if (Number.isNaN(birthDate.getTime())) return false;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    return age < 18;
  }

  /**
   * Convierte una fecha ISO o Date string a formato YYYY-MM-DD para input date.
   */
  private formatDateForInput(date?: string): string {
    if (!date) return '';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().split('T')[0];
  }

  /**
   * Convierte una fecha de input date a ISO.
   * Si viene vacía, retorna undefined para no enviar basura al backend.
   */
  private toIsoDateOrEmpty(date?: string): string | undefined {
    if (!date) return undefined;
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return parsed.toISOString();
  }

  /**
   * Limpia texto obligatorio.
   */
  private cleanText(value: unknown): string {
    return String(value ?? '').trim();
  }

  /**
   * Limpia texto opcional.
   * Si queda vacío, retorna undefined.
   */
  private cleanOptionalText(value: unknown): string | undefined {
    const cleaned = String(value ?? '').trim();
    return cleaned || undefined;
  }
}