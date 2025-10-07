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

  modal: ModalDto = modalInitializer();

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.infoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      birthday: ['', [Validators.required]],
      countryCode: ['+593', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]],
      country: ['EC', [Validators.required]],
      city: ['', [Validators.required]],
    });

    this.loadCities(this.selectedCountryIso);
  }

  ngOnInit(): void {
    // si ya viene userData cargado antes del ngOnChanges
    if (this.userData) {
      this.patchFormValues();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userData'] && this.userData) {
      this.patchFormValues();
    }
  }

  /** Parchea el formulario con los valores del usuario */
  private patchFormValues(): void {
    const phone = this.userData.contact
      ? this.userData.contact.replace(/^\+593/, '0')
      : '';

    const country = this.userData.country || 'EC';
    const city = this.userData.city || '';
    const birthday = this.userData.birthday
      ? this.formatBirthday(this.userData.birthday)
      : '';

    this.infoForm.patchValue({
      email: this.userData.emailAddress || this.userData.email || '',
      birthday,
      countryCode: '+593',
      phoneNumber: phone,
      country,
      city,
    });

    this.loadCities(country);

    // 🔥 Forzamos la detección de cambios para que Angular actualice la vista
    this.cdr.detectChanges();
  }

  /** Ajusta formato de fecha compatible con input[type=date] */
  private formatBirthday(date: string): string {
    // si ya viene en formato YYYY-MM-DD lo deja igual
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
    if (rawNumber.startsWith('0')) {
      rawNumber = rawNumber.slice(1);
    }

    const contact = `${formValue.countryCode}${rawNumber}`;

    const payload = {
      email: formValue.email,
      birthday: formValue.birthday,
      contact,
      city: formValue.city,
      country: formValue.country,
    };

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

      setTimeout(() => {
        this.modal.show = false;
      }, 3000);
      return;
    }

    this.closeModal.emit();
  }
}