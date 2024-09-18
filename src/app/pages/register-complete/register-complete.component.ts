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
import {Observable, switchMap} from "rxjs";
import {selectUserData} from "../../store/user.selector";


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
  modes: string[] = ['PRESENCIAL', 'ONLINE'];
  user: UserDto | null | undefined;
  user$: Observable<UserDto | null>;

  constructor(private fb: FormBuilder,
              private usersService: UsersService,
              private studentsService: StudentsService,
              private router: Router,
              private stagesService: StagesService,
              private store: Store,
  ) {

    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      idNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      birthday: ['', Validators.required],
      role: ['STUDENT', Validators.required],
      stageId: ['', Validators.required],
      mode: ['ONLINE', Validators.required],
    });
    this.user$ = this.store.select(selectUserData);
  }


  ngOnInit(): void {
    this.stagesService.getAll().subscribe(stages => {
      this.stages = stages;
    });

    this.user$.subscribe(state => {
      this.user = state;
    })
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
      email: this.user?.email,
      role: this.registerForm.value.role,
      idNumber: this.registerForm.value.idNumber,
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      birthday: new Date(this.registerForm.value.birthday).toISOString().split('T')[0],
    };

    const studentData: RegisterStudentDto = {
      stageId: parseInt(this.registerForm.controls['stageId'].value, 10),
      userId: this.user?.id,
      mode: this.registerForm.controls['mode'].value,
    }
    this.usersService.completeRegister(userData).pipe(
      switchMap(() => this.studentsService.registerStudent(studentData))
    ).subscribe({
      next: () => {
        this.showSuccessModal = true;

        setTimeout(() => {
          this.closeModal();
          this.router.navigate(['/home']);
        }, 2500);
      },
      error: (error) => {
        console.error('Error in registration:', error);
        this.showRegistrationErrorModal = true;

        setTimeout(() => {
          this.closeModal();
        }, 2000);
      }
    });

  }

  closeModal() {
    this.showModal = false;
    this.showSuccessModal = false;
    this.showRegistrationErrorModal = false;
  }
}
