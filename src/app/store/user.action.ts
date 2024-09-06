// src/app/store/user.actions.ts
import { createAction, props } from '@ngrx/store';

export const setAdminStatus = createAction(
  '[User] Set Admin Status',
  props<{ isAdmin: boolean }>()
);

export const setLoggedInStatus = createAction(
  '[User] Set Logged In Status',
  props<{ isLoggedIn: boolean }>()
);
