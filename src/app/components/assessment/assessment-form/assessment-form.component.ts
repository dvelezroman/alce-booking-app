import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { UserDto } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';
import { AssessmentType, CreateAssessmentI } from '../../../services/dtos/assessment.dto';

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
  @Input() instructorId: number | null = null;
  @Output() assessmentCreated = new EventEmitter<CreateAssessmentI>();
  @Output() studentSelected = new EventEmitter<{ studentId: number, stageId: number, instructorId: number }>();
  
  showCommentBox: boolean = false;
  showPointsError: boolean = false;
  showUserDropdown: boolean = false;
  showTypeRequiredError: boolean = false;
  showStudentRequiredError: boolean = false;

  searchInput$ = new Subject<string>();
  assessmentTypes = Object.values(AssessmentType); 
  selectedStudent?: UserDto;
  type: AssessmentType | null = null;
  points: number | null = null;
  note: string = '';
  searchTerm: string = '';
  selectedResourceId: string = '';
  
  filteredUsers: UserDto[] = [];
  addedResources: { id: number; name: string; content: string }[] = [];
  availableResources: { id: number; name: string; content: string }[] = [];


  constructor(private usersService: UsersService) {
    this.searchInput$.pipe(debounceTime(300)).subscribe((term: string) => {
      this.filterUsers(term);
    });
  }

  ngOnInit(): void {
    // this.availableResources = [
    //   { id: 1, name: 'PDF de Gramática', content: 'https://recursos.com/gramatica.pdf' },
    //   { id: 2, name: 'Video de Pronunciación', content: 'https://recursos.com/pronunciacion' },
    //   { id: 3, name: 'Ficha de ejercicios', content: 'https://recursos.com/ejercicios.pdf' },
    // ];
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
    this.showUserDropdown = false;
    this.showStudentRequiredError = false;
    this.note = '';
    this.points = null;
    this.showCommentBox = false;

    if (user.student?.id && user.student?.stage?.id && this.instructorId !== null) {
      this.studentSelected.emit({
        studentId: user.student.id,
        stageId: user.student.stage.id,
        instructorId: this.instructorId
      });
    }
  }

  hideDropdown(): void {
    setTimeout(() => {
      this.showUserDropdown = false;
    }, 200);
  }

  get isBelowThreshold(): boolean {
    return this.points !== null && this.points < 80;
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
    const requiresComment = this.points !== null && this.points < 85;
    const commentIsValid = this.note.trim().length >= 12;
    const hasResources = this.addedResources.length > 0;

    return requiresComment && (!commentIsValid || !hasResources);
  }

  insertResourceIntoComment(): void {
    const id = Number(this.selectedResourceId);
    const selected = this.availableResources.find(r => r.id === id);

    if (selected && !this.addedResources.find(r => r.id === selected.id)) {
      this.addedResources.push(selected);
      this.note = this.note.trim() + '\n' + selected.content;
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
    if (!this.isPointsInvalid()) {
      this.showPointsError = false;
    }

     if (this.points !== null && this.points >= 85) {
      this.showCommentBox = false;
      this.note = '';
      this.addedResources = [];
      this.selectedResourceId = '';
      setTimeout(() => {
        if (this.resourceSelect?.nativeElement) {
          this.resourceSelect.nativeElement.selectedIndex = 0;
        }
      });
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
    const isTypeValid = this.type !== null && !this.blockedTypes.includes(this.type);

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
      type: this.type!,
      points: this.points!,
      note: this.note || ''
    };

    this.assessmentCreated.emit(payload);
    this.resetForm();
  }

  private resetForm(): void {
    this.note = '';
    this.points = null;
    this.type = null;
    this.showCommentBox = false;
  }
}