import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessementI, AssessmentType } from '../../../services/dtos/assessment.dto';
import { UserDto } from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-assessment-multi-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-multi-table.component.html',
  styleUrl: './assessment-multi-table.component.scss'
})
export class AssessmentMultiTableComponent implements OnChanges {
  @Input() assessments: AssessementI[] = [];
  @Input() maxPointsAssessment: number | null = null;
  @Input() stageTitle: string = '';

  students: { studentId: number; user: UserDto }[] = [];
  types: AssessmentType[] = [];
  groupedAssessments: Record<number, Record<AssessmentType, AssessementI>> = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['assessments']) {
      this.prepareData();
    }
  }

private prepareData(): void {
  this.groupedAssessments = {};
  const typesSet = new Set<AssessmentType>();
  const studentMap = new Map<number, { studentId: number; user: UserDto }>();

  for (const a of this.assessments) {
    const studentId = a.studentId;
    const type = a.type;

    typesSet.add(type);

    if (!this.groupedAssessments[studentId]) {
      this.groupedAssessments[studentId] = {} as Record<AssessmentType, AssessementI>;
    }

    // mostrar la nota mas alta por estudiante y tipo
    const current = this.groupedAssessments[studentId][type];
    if (!current || a.points > current.points) {
      this.groupedAssessments[studentId][type] = a;
    }

    if (a.student?.user) {
      studentMap.set(studentId, { studentId, user: a.student.user });
    }
  }

  this.types = Object.values(AssessmentType);
  this.students = Array.from(studentMap.values());
}

  getAssessments(studentId: number, type: AssessmentType): AssessementI[] {
  const best = this.groupedAssessments[studentId]?.[type];
  return best ? [best] : [];
}

  isMaxReached(points: number): boolean {
    return this.maxPointsAssessment !== null && points >= this.maxPointsAssessment;
  }

  isBelowMax(points: number): boolean {
    return this.maxPointsAssessment !== null && points < this.maxPointsAssessment;
  }
}