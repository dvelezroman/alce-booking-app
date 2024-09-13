import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../services/users.service';
import {UserDto} from '../../services/dtos/user.dto';
import {RegisterStudentDto, Stage} from "../../services/dtos/student.dto";
import {StagesService} from "../../services/stages.service";
import {StudentsService} from "../../services/students.service";
import {Store} from "@ngrx/store";
import {UserState} from "../../store/user.state";


@Component({
  selector: 'app-register-complete',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './register-complete.component.html',
  styleUrl: './register-complete.component.scss'
})
export class RegisterCompleteComponent implements OnInit {
  currentPage = 'register';
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  showModal = false;
  showSuccessModal = false;
  showRegistrationErrorModal = false;
  registerForm: FormGroup;
  stages: Stage[] = [];
  roles = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];
  user: UserDto | null | undefined;

  constructor(private fb: FormBuilder,
              private usersService: UsersService,
              private studentsService: StudentsService,
              private router: Router,
              private stagesService: StagesService,
              private store: Store<{ state: UserState }>
  ) {

    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      idNumber: ['', Validators.pattern(/^[0-9]{10}$/)],
      birthday: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      stageId: ['', Validators.required],
    }, { validator: this.passwordMatchValidator });
  }


  ngOnInit(): void {
    this.stagesService.getAll().subscribe(stages => {
      this.stages = stages;
      console.log(this.stages);
    });

    this.store.subscribe((state) => {
      const userState = (state as any).user;
      if (userState && userState.data) {
        this.user = userState.data as UserDto;
        console.log('datos del usuario en register:', this.user.id);
      } else {
        console.error('no hay nada en el store');
      }
    });

  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }


  onSubmit() {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      this.showModal = true;

      setTimeout(() => {
        this.showModal = false;
      }, 2000);

      return;
    }

    const userData: Partial<UserDto> = {
      email: this.registerForm.value.email,
      role: this.registerForm.value.role,
      idNumber: this.registerForm.value.idNumber,
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      birthday: new Date(this.registerForm.value.birthday).toISOString().split('T')[0]
    };

    const studentData: RegisterStudentDto = {
      stageId: this.registerForm.controls['stageId'].value,
      userId: this.user?.id,
      mode: this.registerForm.controls['mode'].value,
    }

    this.usersService.completeRegister(userData).subscribe({

    });
    this.studentsService.registerStudent(studentData).subscribe({
      next: () => {
        this.showSuccessModal = true;

        setTimeout(() => {
          this.showSuccessModal = false;
          this.router.navigate(['/login']);
        }, 2500);
      },
      error: (error) => {
        console.error('Error en el registro:', error);
        this.showRegistrationErrorModal = true;

        setTimeout(() => {
          this.showRegistrationErrorModal = false;
        }, 2000);

      }
    })
  }


  closeModal() {
    this.showModal = false;
    this.showSuccessModal = false;
  }
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
}
