import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-instructor-admin',
  standalone: true,
  imports: [
      CommonModule,
      ReactiveFormsModule
  ],
  templateUrl: './register-instructor-admin.component.html',
  styleUrl: './register-instructor-admin.component.scss'
})
export class RegisterInstructorAdminComponent implements OnInit {
  registerForm: FormGroup;
  roles: string[] = ['INSTRUCTOR', 'ADMIN']; 
  showInstructorLink: boolean = false;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      idNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      repeatPassword: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthDate: [''],  
      role: [''],
      instructorLink: ['']        
    });
  }

  ngOnInit(): void {
    this.registerForm.get('repeatPassword')?.valueChanges.subscribe(repeatPassword => {
      const password = this.registerForm.get('password')?.value;
      if (password !== repeatPassword) {
        this.registerForm.get('repeatPassword')?.setErrors({ mismatch: true });
      } else {
        this.registerForm.get('repeatPassword')?.setErrors(null);
      }
    });

    this.registerForm.get('role')?.valueChanges.subscribe((role: string) => {
      this.showInstructorLink = role === 'INSTRUCTOR';
      if (!this.showInstructorLink) {
        this.registerForm.get('instructorLink')?.reset(); 
      }
    });
  }
  
}
