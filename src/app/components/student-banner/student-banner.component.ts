import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentResourceI } from '../../services/dtos/assessment-resources.dto';
import { SafeNoteHtmlPipe } from "../../pipes/safe-note-html.pipe";

@Component({
  selector: 'app-student-banner',
  standalone: true,
  imports: [CommonModule, SafeNoteHtmlPipe],
  templateUrl: './student-banner.component.html',
  styleUrls: ['./student-banner.component.scss']
})
export class StudentBannerComponent {
  @Input() type: 'warning' | 'info' = 'info';
  @Input() title: string = '';
  @Input() text: string = '';
  @Input() icon: string = 'info';
  @Input() resources: AssessmentResourceI[] = [];

  isExpanded = true;

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

}