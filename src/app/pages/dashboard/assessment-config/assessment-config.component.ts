import { Component } from '@angular/core';
import { AssessmentConfigFormComponent } from '../../../components/assessment-config/assessment-max-config/assessment-config-form.component';
import { AssessmentMinConfigComponent } from '../../../components/assessment-config/assessment-min-config/assessment-min-config.component';
import { AssessmentDaysConfigFormComponent } from '../../../components/assessment-config/assessment-days-config-form/assessment-days-config-form.component';

@Component({
  selector: 'app-assessment-config',
  standalone: true,
  imports: [ 
      AssessmentConfigFormComponent,
      AssessmentMinConfigComponent,
      AssessmentDaysConfigFormComponent
    ],
  templateUrl: './assessment-config.component.html',
  styleUrl: './assessment-config.component.scss'
})
export class AssessmentConfigComponent {

}
