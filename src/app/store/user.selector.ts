import { createSelector } from '@ngrx/store';
import { UserState } from './user.state';

export const selectUserState = (state: any) => state.user;

export const selectIsAdmin = createSelector(
  selectUserState,
  (state: UserState) => state.isAdmin
);

export const selectIsLoggedIn = createSelector(
  selectUserState,
  (state: UserState) => state.isLoggedIn
);

export const selectIsRegistered = createSelector(
  selectUserState,
  (state: UserState) => state.data?.register
);

export const selectUserData = createSelector(
  selectUserState,
  (state: UserState) => state.data
);

export const selectInstructorLink = createSelector(
  selectUserState,
  (state: UserState) => state.instructorLink
);
