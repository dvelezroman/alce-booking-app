import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-resources-header',
  standalone: true,
  imports: [],
  templateUrl: './resources-header.component.html',
  styleUrl: './resources-header.component.scss'
})
export class ResourcesHeaderComponent {

  @Output() createResource = new EventEmitter<void>();

  onCreateResource(): void {
    this.createResource.emit();
  }

}