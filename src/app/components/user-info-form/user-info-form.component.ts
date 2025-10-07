import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
  @Input() isModalOpen: boolean = false;
  @Input() dataCompleted: boolean = false;
  @Input() userData: any | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() formSubmit = new EventEmitter<any>();

  infoForm: FormGroup;
  countryCodes: CountryCode[] = COUNTRY_CODES;
  cities: string[] = [];
  selectedCountryIso = 'EC';
  selectedCountryCode = '+593';

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
      tutorPhone: [''],
    });

    this.loadCities(this.selectedCountryIso);
  }

  ngOnInit(): void {
    if (this.userData) this.patchFormValues();

    this.infoForm.get('birthday')?.valueChanges.subscribe((birthday: string) => {
      this.isMinor = this.isStudent && !!birthday && this.calculateAge(birthday) < 18;
      this.cdr.detectChanges();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userData'] && this.userData) this.patchFormValues();
  }

  /** Parchea los valores iniciales del formulario */
  private patchFormValues(): void {
    const phone = this.userData.contact
      ? this.userData.contact.replace(/^\+593/, '0')
      : '';

    const country = this.userData.country || 'EC';
    const city = this.userData.city || '';
    const birthday = this.userData.birthday ? this.formatBirthday(this.userData.birthday) : '';

    this.isStudent = this.userData.role === 'STUDENT';
    this.isMinor = this.isStudent && !!birthday && this.calculateAge(birthday) < 18;

    this.infoForm.patchValue({
      email: this.userData.emailAddress || '',
      birthday,
      countryCode: '+593',
      phoneNumber: phone,
      country,
      city,
      occupation: this.userData.occupation || '',
      tutorName: this.userData.tutorName || '',
      tutorEmail: this.userData.tutorEmail || '',
      tutorPhone: this.userData.tutorPhone || '',
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

  onCountryChange(event: Event): void {
    const iso = (event.target as HTMLSelectElement).value;
    this.selectedCountryIso = iso;

    const country = this.countryCodes.find(c => c.iso === iso);
    this.selectedCountryCode = country?.code || '+000';

    this.infoForm.patchValue({
      country: iso,
      countryCode: this.selectedCountryCode,
    });

    this.loadCities(iso);
  }

  private loadCities(iso: string): void {
    this.cities = CITIES_BY_COUNTRY[iso] || [];
  }

  onSubmit(): void {
    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }

    const formValue = this.infoForm.value;
    let rawNumber: string = formValue.phoneNumber.trim();
    if (rawNumber.startsWith('0')) rawNumber = rawNumber.slice(1);
    const contact = `${formValue.countryCode}${rawNumber}`;

    const payload: Partial<UserDto> = {
      email: formValue.email,
      birthday: formValue.birthday,
      contact,
      city: formValue.city,
      country: formValue.country,
      occupation: formValue.occupation,
    };

    if (this.isStudent && this.isMinor) {
      (payload as any).tutorName = formValue.tutorName;
      (payload as any).tutorEmail = formValue.tutorEmail;
      (payload as any).tutorPhone = formValue.tutorPhone;
    }

    console.log('📤 Datos enviados al padre:', payload);
    this.formSubmit.emit(payload);
  }

  close(): void {
    if (!this.dataCompleted) {
      this.modal = {
        ...modalInitializer(),
        show: true,
        isError: true,
        title: 'Atención',
        message: 'Debes completar y guardar el formulario antes de poder cerrarlo.',
        close: () => (this.modal.show = false),
      };

      setTimeout(() => (this.modal.show = false), 3000);
      return;
    }

    this.closeModal.emit();
  }
}