import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { UserDto } from '../../services/dtos/user.dto';
import {RegisterStudentDto, Stage, Student} from "../../services/dtos/student.dto";
import {StagesService} from "../../services/stages.service";
import {StudentsService} from "../../services/students.service";


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

  userId: number | null = null;


  constructor(private fb: FormBuilder,
              private usersService: UsersService,
              private studentsService: StudentsService,
              private router: Router,
              private stagesService: StagesService,
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

    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      this.userId = +storedUserId; 
      console.log(this.userId);
    }
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
      userId: this.userId!, // TODO: aqui colocar el Id del user que esta loggeado
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
