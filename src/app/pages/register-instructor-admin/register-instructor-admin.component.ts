import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../services/users.service';
import { InstructorsService } from '../../services/instructors.service';
import { UserDto, UserRole } from '../../services/dtos/user.dto';
import { RegisterInstructorDto } from '../../services/dtos/instructor.dto';
import { ModalComponent } from '../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';

@Component({
  selector: 'app-register-instructor-admin',
  standalone: true,
  imports: [
      CommonModule,
      ReactiveFormsModule,
      ModalComponent
  ],
  templateUrl: './register-instructor-admin.component.html',
  styleUrl: './register-instructor-admin.component.scss'
})
export class RegisterInstructorAdminComponent implements OnInit {
  registerForm: FormGroup;
  roles: string[] = ['INSTRUCTOR', 'ADMIN']; 
  showInstructorLink: boolean = false;
  modal: ModalDto = modalInitializer();


  constructor(private fb: FormBuilder, 
              private usersService: UsersService,
              private instructorsService: InstructorsService) {
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

  onSubmit() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) {
      this.showModal('Formulario inválido. Por favor revise los campos.', true);
      return;
    }

    const { idNumber, email, password, firstName, lastName, birthDate, role, instructorLink } = this.registerForm.value;

    const newUser: Partial<UserDto> = {
      idNumber,
      email,
      password,
      firstName,
      lastName,
      birthday: birthDate,
      role,
      status: true
    };

    this.usersService.create(newUser).subscribe({
      next: (response) => {
        const createdUserId = response.user.id;

        if (role === UserRole.INSTRUCTOR) {
          const instructorData: RegisterInstructorDto = {
            userId: createdUserId,
            stageId: undefined
          };

          this.instructorsService.registerInstructor(instructorData).subscribe({
            next: () => {
              this.showModal('Instructor registrado correctamente', false, true);
              this.resetForm();
            },
            error: (err) => {
              console.error(err);
              this.showModal('Error al registrar el instructor', true);
            }
          });
        } else if (role === UserRole.ADMIN) {
          this.showModal('Administrador registrado correctamente', false, true);
          this.resetForm();
        }
      },
      error: (err) => {
        console.error(err);
        this.showModal('Error al crear el usuario', true);
      }
    });
  }

  private resetForm() {
    this.registerForm.reset();
    this.showInstructorLink = false;
  }

  private showModal(message: string, isError: boolean, isSuccess: boolean = false) {
    this.modal = {
      ...this.modal,
      show: true,
      message,
      isError,
      isSuccess
    };
  
    setTimeout(() => {
      this.closeModal();
    }, 3000); 
  }

  closeModal() {
    this.modal.show = false;
  }
  
}
