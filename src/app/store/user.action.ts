import { createAction, props } from '@ngrx/store';
import {UserDto} from "../services/dtos/user.dto";

export const setAdminStatus = createAction(
  '[User] Set Admin Status',
  props<{ isAdmin: boolean }>()
);

export const setLoggedInStatus = createAction(
  '[User] Set Logged In Status',
  props<{ isLoggedIn: boolean }>()
);

export const setUserData = createAction(
  '[User] Set Data In Status',
  props<{ data: UserDto | null }>()
);

export const unsetUserData = createAction(
  '[User] Unset Data In Status',
);

export const setInstructorLink = createAction(
  '[User] Set Instructor Link',
  props<{ link: string | null }>()
);

export const setDataCompleted = createAction(
  '[User] Set Data Completed',
  props<{ completed: boolean }>()
)

export const updateUserData = createAction(
  '[User] Update User Data',
  props<{ user: Partial<UserDto> }>()
);
