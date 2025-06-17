import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { UserDto } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';
import { AssessmentType, CreateAssessmentI } from '../../../services/dtos/assessment.dto';
import { AssessmentTypesService } from '../../../services/assessment-types.service';
import { AssessmentTypeI } from '../../../services/dtos/assessment-type.dto';

@Component({
  selector: 'app-assessment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-form.component.html',
  styleUrls: ['./assessment-form.component.scss'],
})
export class AssessmentFormComponent implements OnInit {
  @ViewChild('resourceSelect') resourceSelect!: ElementRef<HTMLSelectElement>;

  @Input() blockedTypes: AssessmentType[] = [];
  @Input() minPointsAssessment: number | null = null;
  @Input() availableResources: { id: number; name: string; content: string }[] = [];
  @Input() instructorId: number | null = null;
  @Output() assessmentCreated = new EventEmitter<CreateAssessmentI>();
  @Output() studentSelected = new EventEmitter<{ studentId: number, instructorId: number }>();

  showCommentBox: boolean = false;
  showPointsError: boolean = false;
  showUserDropdown: boolean = false;
  showTypeRequiredError: boolean = false;
  showStudentRequiredError: boolean = false;

  searchInput$ = new Subject<string>();
  assessmentTypeId: number | null = null;
  assessmentTypesFromApi: AssessmentTypeI[] = [];
  selectedStudent?: UserDto;
  type: AssessmentType | null = null;
  points: number | null = null;
  note: string = '';
  searchTerm: string = '';
  selectedResourceId: string = '';

  filteredUsers: UserDto[] = [];
  addedResources: { id: number; name: string; content: string }[] = [];


  constructor(private usersService: UsersService,
              private assessmentTypesService: AssessmentTypesService
  ) {
    this.searchInput$.pipe(debounceTime(300)).subscribe((term: string) => {
      this.filterUsers(term);
    });
  }

  ngOnInit(): void {
    this.loadAssessmentTypes();
  }

  loadAssessmentTypes(): void {
    this.assessmentTypesService.getAll().subscribe({
      next: (types) => {
        //console.log('Tipos de evaluación cargados:', types); 
        this.assessmentTypesFromApi = types;
      },
      error: () => {
        this.assessmentTypesFromApi = [];
        console.error('Error al cargar los tipos de evaluación.');
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchInput$.next(term);
  }

  filterUsers(term: string): void {
    if (!term || term.trim().length < 2) {
      this.filteredUsers = [];
      this.showUserDropdown = false;
      return;
    }

    this.usersService.searchUsers(undefined, undefined, undefined, term, term, undefined).subscribe({
      next: (result) => {
        this.filteredUsers = result.users;
        this.showUserDropdown = true;
      },
      error: () => {
        this.filteredUsers = [];
        this.showUserDropdown = false;
      }
    });
  }

  selectUser(user: UserDto): void {
    this.selectedStudent = user;
    this.searchTerm = `${user.firstName} ${user.lastName}`;
    this.filteredUsers = [];
    this.assessmentTypeId = null;
    this.showUserDropdown = false;
    this.showStudentRequiredError = false;
    this.note = '';
    this.points = null;
    this.showCommentBox = false;

    if (user.student?.id && user.student?.stage?.id && this.instructorId !== null) {
      this.studentSelected.emit({
        studentId: user.student.id,
        // stageId: user.student.stage.id,
        instructorId: this.instructorId
      });
    }
  }

  hideDropdown(): void {
    setTimeout(() => {
      this.showUserDropdown = false;
    }, 200);
  }

  private isPointsInvalid(): boolean {
    return (
      this.points === null ||
      isNaN(this.points) ||
      this.points < 0 ||
      this.points > 100
    );
  }

  get shouldDisableSubmit(): boolean {
    const requiresComment = this.points !== null && this.minPointsAssessment !== null && this.points < this.minPointsAssessment;
    const commentIsValid = this.note.trim().length >= 12;
    return requiresComment && !commentIsValid;
  }

  addResourceBySelect(): void {
    const id = Number(this.selectedResourceId);
    const selected = this.availableResources.find(r => r.id === id);

    if (selected && !this.addedResources.some(r => r.id === selected.id)) {
      this.addedResources.push(selected);
      this.selectedResourceId = '';
    }
  }

  removeResource(resourceId: number): void {
    const index = this.addedResources.findIndex(r => r.id === resourceId);
    if (index !== -1) {
      const resource = this.addedResources[index];
      this.addedResources.splice(index, 1);
      this.note = this.note.replace(resource.content, '').trim();

      if (this.selectedResourceId === resourceId.toString()) {
        this.selectedResourceId = '';
        setTimeout(() => {
          if (this.resourceSelect?.nativeElement) {
            this.resourceSelect.nativeElement.selectedIndex = 0;
          }
        });
      }
    }
  }

  handlePointsChange(value: number): void {
    this.points = value;

    this.showPointsError = this.isPointsInvalid();

    if (
      this.points !== null &&
      this.minPointsAssessment !== null &&
      this.points >= this.minPointsAssessment
    ) {
      this.showCommentBox = false;
      this.note = '';
      this.addedResources = [];
      this.selectedResourceId = '';
    }
  }

  handleTextareaChange(value: string): void {
    this.note = value;
    const removedResources = this.addedResources.filter(resource => !value.includes(resource.content));

    if (removedResources.length > 0) {
      for (const resource of removedResources) {
        this.addedResources = this.addedResources.filter(r => r.id !== resource.id);

        if (this.selectedResourceId === resource.id.toString()) {
          this.selectedResourceId = '';
          setTimeout(() => {
            if (this.resourceSelect?.nativeElement) {
              this.resourceSelect.nativeElement.selectedIndex = 0;
            }
          });
        }
      }
    }
  }

  submitAssessment(typeControl?: NgModel): void {
    if (typeControl && typeControl.invalid) {
      typeControl.control.markAsTouched();
    }

    const student = this.selectedStudent?.student;
    const stageId = student?.stage?.id;
    const studentId = student?.id;

    const isStudentValid = !!studentId && !!stageId;
    const isTypeValid = this.assessmentTypeId !== null;

    this.showStudentRequiredError = !isStudentValid;

    if (!isStudentValid || !isTypeValid) return;

    if (this.isPointsInvalid()) {
      this.showPointsError = true;
      return;
    }

    this.showPointsError = false;

    const payload: CreateAssessmentI = {
      studentId: studentId!,
      stageId: stageId!,
      instructorId: this.instructorId!,
      type: this.getSelectedTypeEnum(), 
      points: this.points!,
      note: this.note || '',
      assessmentTypeId: this.assessmentTypeId!,
       assessmentResourceIds: this.addedResources.map(r => r.id)
    };

    this.assessmentCreated.emit(payload);
    this.resetForm();
  }

  private getSelectedTypeEnum(): AssessmentType {
    const selected = this.assessmentTypesFromApi.find(t => t.id === this.assessmentTypeId);
    if (!selected) throw new Error('Tipo de evaluación no válido');
    return selected.name as AssessmentType;
  }

  isTypeBlocked(typeName: string): boolean {
    return this.blockedTypes.includes(typeName as AssessmentType);
  }

  private resetForm(): void {
    // this.searchTerm = '';
    this.note = '';
    this.points = null;
    this.assessmentTypeId = null;
    this.selectedResourceId = '';
    this.addedResources = [];
    this.showCommentBox = false;
    // this.selectedStudent = undefined;
  }
}
