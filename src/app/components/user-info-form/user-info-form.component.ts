import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CITIES_BY_COUNTRY, COUNTRY_CODES, CountryCode } from '../../shared/country-code';

@Component({
  selector: 'app-users-info-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user-info-form.component.html',
  styleUrls: ['./user-info-form.component.scss'],
})
export class UserInfoFormComponent {
  @Input() isModalOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() formSubmit = new EventEmitter<any>();

  infoForm: FormGroup;
  countryCodes: CountryCode[] = COUNTRY_CODES;
  cities: string[] = [];
  selectedCountryIso = 'EC';
  selectedCountryCode = '+593';

  constructor(private fb: FormBuilder) {
    this.infoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['+593', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]],
      country: ['EC', [Validators.required]],
      city: ['', [Validators.required]],
    });

    this.loadCities(this.selectedCountryIso);
  }

  onCountryChange(event: Event): void {
    const iso = (event.target as HTMLSelectElement).value;

    this.selectedCountryIso = iso;
    const country = this.countryCodes.find(c => c.iso === iso);
    this.selectedCountryCode = country?.code || '+000';

    this.infoForm.patchValue({
      country: iso,
      countryCode: this.selectedCountryCode,
      city: '',
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
      contact,
      city: formValue.city,
      country: formValue.country,
    };

    this.formSubmit.emit(payload);
  }

  close(): void {
    this.closeModal.emit();
  }
}