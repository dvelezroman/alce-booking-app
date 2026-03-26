import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRole } from '../../../services/dtos/user.dto';
import { StudentClassification } from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-announcement-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './announcement-form.component.html',
  styleUrl: './announcement-form.component.scss'
})
export class AnnouncementFormComponent {

  @Input() title: string = '';
  @Input() type: 'promotion' | 'relocation' = 'promotion';

  @Input() role: UserRole | null = null;
  @Input() classification: StudentClassification | null = null;

  @Input() city: 'Portoviejo' | 'Cuenca' | null = null;
  @Input() isActive: boolean = true;

  @Output() titleChange = new EventEmitter<string>();
  @Output() typeChange = new EventEmitter<'promotion' | 'relocation'>();

  @Output() roleChange = new EventEmitter<UserRole | null>();
  @Output() classificationChange = new EventEmitter<StudentClassification | null>();

  @Output() cityChange = new EventEmitter<'Portoviejo' | 'Cuenca' | null>();
  @Output() isActiveChange = new EventEmitter<boolean>();

}