import { createReducer, on } from '@ngrx/store';
import { setAdminStatus, setLoggedInStatus, setUserData } from './user.action';
import { UserState } from './user.state';

const initialState: UserState = {
  isAdmin: false,
  isLoggedIn: false,
  data: null,
};

export const userReducer = createReducer(
  initialState,
  on(setAdminStatus, (state, { isAdmin }) => ({ ...state, isAdmin })),
  on(setLoggedInStatus, (state, { isLoggedIn }) => ({ ...state, isLoggedIn })),
  on(setUserData, (state, { data }) => ({ ...state, data })),
);
