import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private _spinnerSubject = new BehaviorSubject<boolean>(false);
  spinnerState$ = this._spinnerSubject.asObservable();

  show() {
    this._spinnerSubject.next(true);
  }

  hide() {
    this._spinnerSubject.next(false);
  }
}
