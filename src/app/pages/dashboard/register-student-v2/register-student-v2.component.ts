import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';

import {
  Mode,
  Stage,
  StudentClassification,
} from '../../../services/dtos/student.dto';

import {
  UserDto,
  UserRole,
} from '../../../services/dtos/user.dto';

import { StagesService } from '../../../services/stages.service';
import { StudentsService } from '../../../services/students.service';
import { UsersService } from '../../../services/users.service';

/* =========================
   CHILD COMPONENTS
========================= */

import { RegisterStudentHeaderComponent } from '../../../components/register-user/register-student-v2/register-student-header/register-student-header.component';
import { RegisterStudentPersonalInfoComponent } from '../../../components/register-user/register-student-v2/register-student-personal-info/register-student-personal-info.component';
import { RegisterStudentAcademicInfoComponent } from '../../../components/register-user/register-student-v2/register-student-academic-info/register-student-academic-info.component';
import { RegisterStudentTutorInfoComponent } from '../../../components/register-user/register-student-v2/register-student-tutor-info/register-student-tutor-info.component';
import { RegisterStudentSummaryComponent } from '../../../components/register-user/register-student-v2/register-student-summary/register-student-summary.component';
import { RegisterStudentActionsComponent } from '../../../components/register-user/register-student-v2/register-student-actions/register-student-actions.component';


@Component({
  selector: 'app-register-student-v2',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ModalComponent,
    RegisterStudentHeaderComponent,
    RegisterStudentPersonalInfoComponent,
    RegisterStudentAcademicInfoComponent,
    RegisterStudentTutorInfoComponent,
    RegisterStudentSummaryComponent,
    RegisterStudentActionsComponent,
  ],
  templateUrl: './register-student-v2.component.html',
  styleUrl: './register-student-v2.component.scss',
})
export class RegisterStudentV2Component implements OnInit {

  /* =========================
     STATE
  ========================= */

  modal: ModalDto = modalInitializer();

  registerForm: FormGroup;

  stages: Stage[] = [];
  instructors: UserDto[] = [];

  isMinor = false;

  modes = Object.values(Mode);

  studentClassifications =
    Object.values(StudentClassification);


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private fb: FormBuilder,
    private studentsService: StudentsService,
    private usersService: UsersService,
    private stagesService: StagesService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      idNumber: ['', Validators.required],
      email: ['', Validators.required],

      emailAddress: [
        '',
        [
          Validators.required,
          Validators.email,
        ],
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
        ],
      ],

      birthday: ['', Validators.required],

      studentClassification: [
        '',
        Validators.required,
      ],

      stageId: ['', Validators.required],
      mode: ['', Validators.required],

      startClassDate: [''],
      endClassDate: [''],

      tutorName: [''],
      tutorEmail: [''],
      tutorPhone: [''],
    });
  }


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.loadStages();
    this.loadInstructors();
    this.listenBirthdayChanges();
  }


  /* =========================
     LOAD DATA
  ========================= */

  private loadStages(): void {
    this.stagesService
      .getAll()
      .subscribe(
        stages => {
          this.stages =
            this.filterAndSortStages(stages);
        },
      );
  }

  private loadInstructors(): void {
    this.usersService
      .searchUsers(
        0,
        1000,
        undefined,
        undefined,
        undefined,
        undefined,
        UserRole.INSTRUCTOR,
      )
      .subscribe({
        next: (res) => {
          this.instructors = res.users;
        },

        error: (err) => {
          console.error(
            'Error cargando instructores:',
            err,
          );
        },
      });
  }

  private listenBirthdayChanges(): void {
    this.registerForm
      .get('birthday')
      ?.valueChanges
      .subscribe(
        (birthday: string) => {
          this.isMinor =
            this.calculateAge(birthday) < 18;

          if (!this.isMinor) {
            this.registerForm
              .get('tutorId')
              ?.setValue('');
          }
        },
      );
  }


  /* =========================
     AGE
  ========================= */

  private calculateAge(
    birthDateString: string,
  ): number {
    if (!birthDateString) {
      return 0;
    }

    const today = new Date();
    const birthDate =
      new Date(birthDateString);

    let age =
      today.getFullYear() -
      birthDate.getFullYear();

    const monthDifference =
      today.getMonth() -
      birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (
        monthDifference === 0 &&
        today.getDate() <
          birthDate.getDate()
      )
    ) {
      age--;
    }

    return age;
  }


  /* =========================
     STAGES
  ========================= */

  private filterAndSortStages(
    stages: Stage[],
  ): Stage[] {
    const getStageNumber = (
      description: string,
    ): number => {
      const match =
        description.match(
          /\d+(\.\d+)?/,
        );

      return match
        ? parseFloat(match[0])
        : 0;
    };

    return stages
      .filter(
        stage => {
          const description =
            stage.description.toUpperCase();

          return (
            !description.startsWith('K-STG') &&
            description !== 'STAGE 1.0'
          );
        },
      )
      .sort(
        (a, b) =>
          getStageNumber(a.description) -
          getStageNumber(b.description),
      );
  }


  /* =========================
     SUBMIT
  ========================= */

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(
        this.registerForm,
      );

      this.showError(
        'El formulario debe ser completado.',
      );

      return;
    }

    const form =
      this.registerForm.value;

    const {
      stageId,
      mode,
      studentClassification,
    } = form;

    if (
      !stageId ||
      !mode ||
      !studentClassification
    ) {
      this.showError(
        'Debe completar todos los datos académicos antes de continuar.',
      );

      return;
    }

    if (
      this.isMinor &&
      (
        !form.tutorName?.trim() ||
        !form.tutorEmail?.trim() ||
        !form.tutorPhone?.trim()
      )
    ) {
      this.showError(
        'Debe completar los datos del tutor antes de continuar.',
      );

      return;
    }

    const userData: Omit<UserDto, 'id'> = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      idNumber: form.idNumber.toString(),
      birthday: form.birthday,
      role: UserRole.STUDENT,
      emailAddress: form.emailAddress,
    };

    this.usersService
      .create(userData)
      .subscribe({
        next: (userResponse) => {
          this.registerStudent(
            userResponse.user.id,
          );
        },

        error: (error) => {
          console.error(
            'Error al crear usuario:',
            error,
          );

          const message =
            error?.error?.code === 422
              ? 'Ya existe un usuario registrado con esos datos.'
              : 'No se pudo registrar el usuario.';

          this.showError(message);
        },
      });
  }


  /* =========================
     REGISTER STUDENT
  ========================= */

  private registerStudent(
    userId: number,
  ): void {
    const form =
      this.registerForm.value;

    const studentData: any = {
      userId,
      stageId:
        parseInt(form.stageId, 10),

      mode:
        form.mode,

      studentClassification:
        form.studentClassification,
    };

    if (form.startClassDate) {
      studentData.startClassDate =
        new Date(
          form.startClassDate,
        ).toISOString();
    }

    if (form.endClassDate) {
      studentData.endClassDate =
        new Date(
          form.endClassDate,
        ).toISOString();
    }

    if (this.isMinor) {
      studentData.tutorName =
        form.tutorName;

      studentData.tutorEmail =
        form.tutorEmail;

      studentData.tutorPhone =
        form.tutorPhone;
    }

    this.studentsService
      .registerStudent(studentData)
      .subscribe({
        next: () => {
          this.showModal(
            this.createModalParams(
              false,
              'Registro exitoso.',
            ),
          );

          setTimeout(
            () => {
              this.router.navigate([
                '/students',
              ]);
            },
            2000,
          );
        },

        error: (error) => {
          console.error(
            'Error al registrar estudiante:',
            error,
          );

          this.showError(
            'No se pudo registrar el estudiante.',
          );
        },
      });
  }


  /* =========================
     FORM VALIDATION
  ========================= */

  private markFormGroupTouched(
    formGroup: FormGroup,
  ): void {
    Object
      .values(formGroup.controls)
      .forEach(
        control => {
          control.markAsTouched();
          control.markAsDirty();
        },
      );
  }


  /* =========================
     MODAL
  ========================= */

  private showError(
    message: string,
  ): void {
    this.showModal(
      this.createModalParams(
        true,
        message,
      ),
    );
  }

  createModalParams(
    isError: boolean,
    message: string,
  ): ModalDto {
    return {
      ...this.modal,
      show: true,
      isError,
      isSuccess: !isError,
      message,
      close: this.closeModal,
    };
  }

  showModal(
    params: ModalDto,
  ): void {
    this.modal = {
      ...params,
    };

    setTimeout(
      () => {
        this.modal.close();
      },
      2500,
    );
  }

  closeModal = (): void => {
    this.modal = {
      ...modalInitializer(),
    };
  };
}