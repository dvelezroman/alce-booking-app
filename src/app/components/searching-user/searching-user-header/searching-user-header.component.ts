import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-searching-user-header',
  standalone: true,
  imports: [],
  templateUrl: './searching-user-header.component.html',
  styleUrl: './searching-user-header.component.scss',
})
export class SearchingUserHeaderComponent {

  @Output()
  helpRequested = new EventEmitter<void>();

  onHelpRequested(): void {
    this.helpRequested.emit();
  }

}