import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { Stage, RegisterStudentDto, Mode, StudentClassification } from '../../../services/dtos/student.dto';
import { UserDto, UserRole } from '../../../services/dtos/user.dto';
import { StagesService } from '../../../services/stages.service';
import { StudentsService } from '../../../services/students.service';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-register-student',
  standalone: true,
  imports: [CommonModule,
            RouterModule,
            ReactiveFormsModule,
            ModalComponent],
  templateUrl: './register-student.component.html',
  styleUrl: './register-student.component.scss'
})
export class RegisterStudentComponent implements OnInit {
  modal: ModalDto = modalInitializer();

  registerForm: FormGroup;
  stages: Stage[] = [];
  instructors: UserDto[] = [];
  isMinor = false;

  modes = Object.values(Mode);
  studentClassifications = Object.values(StudentClassification);


  constructor(
    private fb: FormBuilder,
    private studentsService: StudentsService,
    private usersService: UsersService,
    private stagesService: StagesService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      idNumber: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      birthday: ['', Validators.required],
      studentClassification: ['', Validators.required],
      stageId: ['', Validators.required],
      mode: ['', Validators.required],
      startClassDate: [''],
      endClassDate: [''], 
      tutorId: [''],
    });
  }

  ngOnInit(): void {
    // Obtener stages
    this.stagesService.getAll().subscribe((stages) => {
      this.stages = this.filterAndSortStages(stages);
    });

    // Obtener instructores para el campo tutor
    this.usersService.searchUsers(0, 1000, undefined, undefined, undefined, undefined, UserRole.INSTRUCTOR)
      .subscribe({
        next: (res) => this.instructors = res.users,
        error: (err) => console.error('Error cargando instructores:', err)
      });

    // Detectar si el estudiante es menor
      this.registerForm.get('birthday')?.valueChanges.subscribe((birthday: string) => {
      this.isMinor = this.calculateAge(birthday) < 18;

      const tutorControl = this.registerForm.get('tutorId');
      if (!this.isMinor) {
        tutorControl?.setValue('');
      }
    });
  }

  private calculateAge(birthDateString: string): number {
    if (!birthDateString) return 0;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }

  private filterAndSortStages(stages: Stage[]): Stage[] {
    return stages
      .filter(stage => {
        const desc = stage.description.toUpperCase();
        return !desc.startsWith('K-STG') && desc !== 'STAGE 1.0';
      })
      .sort((a, b) => {
        const getNumber = (desc: string) => {
          const match = desc.match(/\d+(\.\d+)?/);
          return match ? parseFloat(match[0]) : 0;
        };

        return getNumber(a.description) - getNumber(b.description);
      });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      this.showModal(this.createModalParams(true, 'El formulario debe ser completado.'));
      return;
    }

    const userData: Omit<UserDto, 'id'> = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      idNumber: this.registerForm.value.idNumber.toString(),
      birthday: this.registerForm.value.birthday,
      role: UserRole.STUDENT,
    };

     const startClassDate = this.registerForm.value.startClassDate
        ? new Date(this.registerForm.value.startClassDate).toISOString()
        : null;

      const endClassDate = this.registerForm.value.endClassDate
        ? new Date(this.registerForm.value.endClassDate).toISOString()
        : null;

    this.usersService.create(userData).subscribe({
      next: (userResponse) => {
        const studentData: RegisterStudentDto = {
          userId: userResponse.user.id,
          stageId: parseInt(this.registerForm.value.stageId, 10),
          mode: this.registerForm.value.mode,
          studentClassification: this.registerForm.value.studentClassification,
          startClassDate,
          endClassDate,
          tutorId: this.isMinor ? Number(this.registerForm.value.tutorId) : null,
        };

        this.studentsService.registerStudent(studentData).subscribe({
          next: () => {
            this.showModal(this.createModalParams(false, 'Registro exitoso.'));
            setTimeout(() => {
              this.router.navigate(['/students']);
            }, 2000);
          },
          error: (error) => {
            console.error('Error al registrar estudiante:', error);
            this.showModal(this.createModalParams(true, 'No se pudo registrar el estudiante.'));
          },
        });
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        this.showModal(this.createModalParams(true, 'No se pudo registrar el usuario.'));
      },
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }

  createModalParams(isError: boolean, message: string): ModalDto {
    return {
      ...this.modal,
      show: true,
      isError,
      isSuccess: !isError,
      message,
      close: this.closeModal,
    };
  }

  showModal(params: ModalDto) {
    this.modal = { ...params };
    setTimeout(() => {
      this.modal.close();
    }, 2500);
  }

  closeModal = () => {
    this.modal = { ...modalInitializer() };
  };
}
