import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

@Component({
  selector: 'app-stage-resources-header',
  standalone: true,
  imports: [],
  templateUrl: './stage-resources-header.component.html',
  styleUrl: './stage-resources-header.component.scss'
})
export class StageResourcesHeaderComponent {

  @Output() createResource = new EventEmitter<void>();


  onCreateResource(): void {
    this.createResource.emit();
  }

}