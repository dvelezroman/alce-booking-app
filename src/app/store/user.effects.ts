// src/app/store/user.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { setAdminStatus } from './user.action';

@Injectable()
export class UserEffects {
  constructor(private actions$: Actions) {}

  logAdminStatus$ = createEffect(
    () => this.actions$.pipe(
      ofType(setAdminStatus),
      tap(action => console.log('Admin status changed:', action.isAdmin))
    ),
    { dispatch: false }
  );
}
