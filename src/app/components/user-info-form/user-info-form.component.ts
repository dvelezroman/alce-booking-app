import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CITIES_BY_COUNTRY, COUNTRY_CODES, CountryCode } from '../../shared/country-code';
import { ModalComponent } from '../modal/modal.component';
import { ModalDto, modalInitializer } from '../modal/modal.dto';
import { UserDto } from '../../services/dtos/user.dto';

@Component({
  selector: 'app-users-info-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ModalComponent],
  templateUrl: './user-info-form.component.html',
  styleUrls: ['./user-info-form.component.scss'],
})
export class UserInfoFormComponent implements OnChanges, OnInit {
  @Input() isModalOpen = false;
  @Input() dataCompleted = false;
  @Input() userData: any | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() formSubmit = new EventEmitter<any>();

  infoForm: FormGroup;
  countryCodes: CountryCode[] = COUNTRY_CODES;
  cities: string[] = [];

  selectedCountryIso = 'EC';
  selectedCountryCode = '+593';
  selectedTutorCountryIso = 'EC';
  selectedTutorCountryCode = '+593';

  isStudent = false;
  isMinor = false;

  modal: ModalDto = modalInitializer();

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.infoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      birthday: ['', [Validators.required]],
      countryCode: ['+593', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]],
      country: ['EC', [Validators.required]],
      city: ['', [Validators.required]],
      occupation: ['', [Validators.required]],
      tutorName: [''],
      tutorEmail: [''],
      tutorCountryCode: ['+593'],
      tutorPhone: [''],
    });

    this.loadCities(this.selectedCountryIso);
  }

  ngOnInit(): void {
    if (this.userData) this.patchFormValues();

    this.infoForm.get('birthday')?.valueChanges.subscribe((birthday: string) => {
      this.isMinor = this.isStudent && !!birthday && this.calculateAge(birthday) < 18;

      if (this.isMinor) {
        this.addTutorValidators();
      } else {
        this.removeTutorValidators();
      }

      this.cdr.detectChanges();
    });
  }

  private addTutorValidators(): void {
    this.infoForm.get('tutorName')?.setValidators([Validators.required]);
    this.infoForm.get('tutorEmail')?.setValidators([Validators.required, Validators.email]);
    this.infoForm.get('tutorPhone')?.setValidators([Validators.required, Validators.pattern('^[0-9]{7,15}$')]);
    this.infoForm.updateValueAndValidity();
  }

  /** Remueve los validadores de tutor */
  private removeTutorValidators(): void {
    this.infoForm.get('tutorName')?.clearValidators();
    this.infoForm.get('tutorEmail')?.clearValidators();
    this.infoForm.get('tutorPhone')?.clearValidators();
    this.infoForm.updateValueAndValidity();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userData'] && this.userData) this.patchFormValues();
  }

  /** Parchea los valores iniciales del formulario */
  private patchFormValues(): void {
    const student = this.userData.student || {};

    // Teléfono principal
    const phone = this.userData.contact
      ? this.userData.contact.replace(/^\+593/, '0')
      : '';

    // Teléfono tutor
    const tutorPhone = student.tutorPhone
      ? student.tutorPhone.replace(/^\+593/, '0')
      : '';

    const country = this.userData.country || 'EC';
    const city = this.userData.city || '';
    const birthday = this.userData.birthday ? this.formatBirthday(this.userData.birthday) : '';

    this.isStudent = this.userData.role === 'STUDENT';
    this.isMinor =
      this.isStudent && !!birthday && this.calculateAge(birthday) < 18;

    this.infoForm.patchValue({
      email: this.userData.emailAddress || '',
      birthday,
      countryCode: '+593',
      phoneNumber: phone,
      country,
      city,
      occupation: this.userData.occupation || '',
      tutorName: student.tutorName || '',
      tutorEmail: student.tutorEmail || '',
      tutorCountryCode: '+593',
      tutorPhone: tutorPhone,
    });

    this.loadCities(country);
    this.cdr.detectChanges();
  }

  /** Calcular edad */
  private calculateAge(dateStr: string): number {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  }

  /** Ajusta formato de fecha compatible con input[type=date] */
  private formatBirthday(date: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return '';
    return parsed.toISOString().split('T')[0];
  }

  /** Cambio de país principal */
  onCountryChange(event: Event): void {
    const iso = (event.target as HTMLSelectElement).value;
    this.selectedCountryIso = iso;

    const country = this.countryCodes.find((c) => c.iso === iso);
    this.selectedCountryCode = country?.code || '+000';

    this.infoForm.patchValue({
      country: iso,
      countryCode: this.selectedCountryCode,
    });

    this.loadCities(iso);
  }

  /** Cambio de país del tutor */
  onTutorCountryChange(event: Event): void {
    const iso = (event.target as HTMLSelectElement).value;
    this.selectedTutorCountryIso = iso;

    const country = this.countryCodes.find((c) => c.iso === iso);
    this.selectedTutorCountryCode = country?.code || '+000';

    this.infoForm.patchValue({
      tutorCountryCode: this.selectedTutorCountryCode,
    });
  }

  private loadCities(iso: string): void {
    this.cities = CITIES_BY_COUNTRY[iso] || [];
  }

  /** Enviar formulario */
  onSubmit(): void {
    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }

    const formValue = this.infoForm.value;

    // Validación especial: si es menor de edad y faltan datos del tutor
    if (this.isStudent && this.isMinor) {
      const tutorName = formValue.tutorName?.trim();
      const tutorEmail = formValue.tutorEmail?.trim();
      const tutorPhone = formValue.tutorPhone?.trim();

      if (!tutorName || !tutorEmail || !tutorPhone) {
        this.modal = {
          ...modalInitializer(),
          show: true,
          isError: true,
          title: 'Campos obligatorios',
          message: 'Debes completar todos los datos del representante antes de guardar.',
          close: () => (this.modal.show = false),
        };
        setTimeout(() => (this.modal.show = false), 3000);
        return;
      }
    }

    // Teléfono principal
    let rawNumber: string = formValue.phoneNumber.trim();
    if (rawNumber.startsWith('0')) rawNumber = rawNumber.slice(1);
    const contact = `${formValue.countryCode}${rawNumber}`;

    // Teléfono del tutor
    let tutorNumber: string = formValue.tutorPhone.trim();
    if (tutorNumber.startsWith('0')) tutorNumber = tutorNumber.slice(1);
    const tutorPhoneFull = formValue.tutorCountryCode + tutorNumber;

    // Payload base del usuario
    const payload: Partial<UserDto> = {
      email: formValue.email,
      birthday: formValue.birthday,
      contact,
      city: formValue.city,
      country: formValue.country,
      occupation: formValue.occupation,
    };

    // 🧩 Si es estudiante menor, incluir datos del tutor
    if (this.isStudent && this.isMinor) {
      (payload as any).tutorName = formValue.tutorName;
      (payload as any).tutorEmail = formValue.tutorEmail;
      (payload as any).tutorPhone = tutorPhoneFull;
    }

    this.formSubmit.emit(payload);
  }

  // close(): void {
  //   // Si el usuario es estudiante menor de edad, verificar datos del tutor antes de cerrar
  //   if (this.isStudent && this.isMinor) {
  //     const formValue = this.infoForm.value;
  //     const tutorName = formValue.tutorName?.trim();
  //     const tutorEmail = formValue.tutorEmail?.trim();
  //     const tutorPhone = formValue.tutorPhone?.trim();

  //     if (!tutorName || !tutorEmail || !tutorPhone) {
  //       this.modal = {
  //         ...modalInitializer(),
  //         show: true,
  //         isError: true,
  //         title: 'Campos obligatorios',
  //         message: 'Debes completar todos los datos del representante antes de cerrar el formulario.',
  //         close: () => (this.modal.show = false),
  //       };
  //       setTimeout(() => (this.modal.show = false), 3000);
  //       return;
  //     }
  //   }

  //   // Si no ha completado los datos generales, también impedir el cierre
  //   if (!this.dataCompleted) {
  //     this.modal = {
  //       ...modalInitializer(),
  //       show: true,
  //       isError: true,
  //       title: 'Atención',
  //       message: 'Debes completar y guardar el formulario antes de poder cerrarlo.',
  //       close: () => (this.modal.show = false),
  //     };
  //     setTimeout(() => (this.modal.show = false), 3000);
  //     return;
  //   }

  //   this.closeModal.emit();
  // }

  close(): void {
    if (!this.dataCompleted || (this.isStudent && this.isMinor)) {
      this.modal = {
        ...modalInitializer(),
        show: true,
        isError: false,
        title: 'Recordatorio',
        message: 'Podrás completar estos datos más tarde.',
        close: () => (this.modal.show = false),
      };
      setTimeout(() => (this.modal.show = false), 2500);
    }
    this.closeModal.emit();
  }

  /** Permite cerrar el modal sin completar el formulario */
  cancelLater(): void {
    this.closeModal.emit();
  }
}