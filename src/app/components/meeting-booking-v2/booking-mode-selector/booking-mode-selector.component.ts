import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Mode } from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-booking-mode-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-mode-selector.component.html',
  styleUrl: './booking-mode-selector.component.scss'
})
export class BookingModeSelectorComponent {

  readonly mode = Mode;

  @Input() selectedMode: Mode | null = null;
  @Input() onlineDisabled = false;
  @Input() presencialDisabled = false;
  @Output() modeSelected =

    new EventEmitter<Mode>();

  selectMode(mode: Mode): void {
    if (this.isModeDisabled(mode)) {
      return;
    }

    this.modeSelected.emit(mode);
  }

  isModeSelected(mode: Mode): boolean {
    return this.selectedMode === mode;
  }

  isModeDisabled(mode: Mode): boolean {
    if (mode === Mode.ONLINE) {
      return this.onlineDisabled;
    }

    if (mode === Mode.PRESENCIAL) {
      return this.presencialDisabled;
    }

    return true;
  }

}
