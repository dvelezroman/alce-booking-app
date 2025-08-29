import { Component, Input, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserSelectorComponent } from '../user-selector/user-selector.component';
import { StageSelectorComponent } from '../stage-selector/stage-selector.component';
import { GroupListComponent } from '../group-list/group-list.component';
import { Stage } from '../../../services/dtos/student.dto'; 

@Component({
  selector: 'app-notification-form-wrapper',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserSelectorComponent,
    StageSelectorComponent,
    GroupListComponent
  ],
  templateUrl: './notification-form-wrapper.component.html',
  styleUrl: './notification-form-wrapper.component.scss',
})
export class NotificationFormWrapperComponent {
  @Input() selectedType: 'user' | 'stage' | 'group' = 'user';
  @Input() stages: Stage[] = []; 

  @ViewChild('formRef') formRef!: NgForm;

  title = '';
  message = '';

  submitForm() {
    if (!this.formRef.valid) return;

    const payload = {
      type: this.selectedType,
      title: this.title,
      message: this.message,
    };

    console.log('Enviando notificación:', payload);
  }
}