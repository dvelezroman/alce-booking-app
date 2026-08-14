import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export type SearchingUserFormType =
  | 'student'
  | 'user'
  | 'code';

@Component({
  selector: 'app-searching-user-search-type',
  standalone: true,
  imports: [],
  templateUrl: './searching-user-search-type.component.html',
  styleUrl: './searching-user-search-type.component.scss',
})
export class SearchingUserSearchTypeComponent {

  @Input()
  currentForm: SearchingUserFormType = 'student';

  @Output()
  formChange = new EventEmitter<SearchingUserFormType>();


  /* =========================
     FORM SELECTION
  ========================== */

  selectForm(
    formType: SearchingUserFormType,
  ): void {
    if (this.currentForm === formType) {
      return;
    }

    this.formChange.emit(formType);
  }


  /* =========================
     ACTIVE STATE
  ========================== */

  isActive(
    formType: SearchingUserFormType,
  ): boolean {
    return this.currentForm === formType;
  }

}