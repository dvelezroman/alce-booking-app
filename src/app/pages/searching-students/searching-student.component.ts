import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../components/modal/modal.component';
import {UsersService} from "../../services/users.service";

@Component({
  selector: 'app-searching-students-student',
  standalone: true,
  imports: [
      CommonModule,
      ReactiveFormsModule,
      ModalComponent
  ],
  templateUrl: './searching-student.component.html',
  styleUrl: './searching-student.component.scss'
})
export class SearchingStudentComponent {
  isStudentForm = true;
  studentForm!: FormGroup;
  userForm!: FormGroup;

  showModal: boolean = false;
  modalMessage: string = '';
  modalIsError: boolean = false;
  modalIsSuccess: boolean = false;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
  ) {}

  ngOnInit() {
    this.studentForm = this.fb.group({
      userId: [''],
      firstName: [''],
      lastName: ['']
    });

    this.userForm = this.fb.group({
      email: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  toggleForm() {
    if (this.isStudentForm) {
      this.userForm.reset();
    } else {
      this.studentForm.reset();
    }
    this.isStudentForm = !this.isStudentForm;
  }

  onSubmit() {
    if (this.isStudentForm) {
      const { userId, firstName, lastName } = this.studentForm.value;
      if (userId) {
        console.log('Buscar por ID Card:', userId);
      } else if (firstName && lastName) {
        console.log('Buscar por nombre y apellido:', firstName, lastName);
      } else {
        this.showErrorModal('Agregue el ID Card o los nombres del estudiante.');
      }
    } else {
      if (this.userForm.valid) {
        const { email, role } = this.userForm.value;
        console.log('Buscar por email y rol:', email, role);
      } else {
        this.userForm.markAllAsTouched();
        this.showErrorModal('Ambos campos son obligatorios.');
      }
    }
  }

  showErrorModal(message: string) {
    this.modalIsSuccess = false;
    this.modalIsError = true;
    this.modalMessage = message;
    this.showModal = true;

    setTimeout(() => {
      this.closeModal();
    }, 3000);
  }

  closeModal() {
    this.showModal = false;
  }

}
