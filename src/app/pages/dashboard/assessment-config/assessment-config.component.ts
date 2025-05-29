import { Component } from '@angular/core';
import { AssessmentConfigFormComponent } from '../../../components/assessment-config-form/assessment-config-form.component';
import { AssessmentMinConfigComponent } from '../../../components/assessment-min-config/assessment-min-config.component';

@Component({
  selector: 'app-assessment-config',
  standalone: true,
  imports: [ 
      AssessmentConfigFormComponent,
      AssessmentMinConfigComponent
    ],
  templateUrl: './assessment-config.component.html',
  styleUrl: './assessment-config.component.scss'
})
export class AssessmentConfigComponent {

}
