// src/app/store/user.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { setAdminStatus, setLoggedInStatus } from './user.action';
import { UserState } from './user.state';

const initialState: UserState = {
  isAdmin: false,
  isLoggedIn: false
};

export const userReducer = createReducer(
  initialState,
  on(setAdminStatus, (state, { isAdmin }) => ({ ...state, isAdmin })),
  on(setLoggedInStatus, (state, { isLoggedIn }) => ({ ...state, isLoggedIn }))
);
