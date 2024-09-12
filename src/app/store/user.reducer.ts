import { createReducer, on } from '@ngrx/store';
import {setAdminStatus, setLoggedInStatus, setUserData} from './user.action';
import { UserState } from './user.state';
import {UserDto} from "../services/dtos/user.dto";

const initialState: UserState = {
  isAdmin: false,
  isLoggedIn: false,
  user: null,
};

export const userReducer = createReducer(
  initialState,
  on(setAdminStatus, (state, { isAdmin }) => ({ ...state, isAdmin })),
  on(setLoggedInStatus, (state, { isLoggedIn }) => ({ ...state, isLoggedIn })),
  on(setUserData, (state, { user }: { user: UserDto | null }) => ({ ...state, user })),
);
