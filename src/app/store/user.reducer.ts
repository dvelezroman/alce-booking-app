import { createReducer, on } from '@ngrx/store';
import {
  setAdminStatus,
  setDataCompleted,
  setInstructorLink,
  setLoggedInStatus,
  setUserData,
  unsetUserData,
  updateStudentData,
  updateUserData,
} from './user.action';
import { UserState } from './user.state';
import { Student } from '../services/dtos/student.dto';

const initialState: UserState = {
  isAdmin: false,
  isLoggedIn: false,
  data: null,
  instructorLink: null,
};

export const userReducer = createReducer(
  initialState,
  on(setAdminStatus, (state, { isAdmin }) => ({ ...state, isAdmin })),
  on(setLoggedInStatus, (state, { isLoggedIn }) => ({ ...state, isLoggedIn })),
  on(setUserData, (state, { data }) => ({ ...state, data })),
  on(unsetUserData, () => ({ ...initialState })),
  on(setInstructorLink, (state, { link }) => ({ ...state, instructorLink: link })),
  on(setDataCompleted, (state, { completed }) => {
    const stateCopy = { ...state };
    if (stateCopy && stateCopy.data) {
      return { ...stateCopy, data: { ...stateCopy.data, dataCompleted: completed } };
    }
    return { ...state };
  }),

  on(updateUserData, (state, { user }) => {
    if (!state.data) return state;
    return {
      ...state,
      data: {
        ...state.data,
        ...user,
      },
    };
  }),

  on(updateStudentData, (state, { student }): UserState => {
    if (!state.data) return state;

    const updatedStudent: Student = {
      ...(state.data.student || ({} as Student)),
      ...student,
    };

    return {
      ...state,
      data: {
        ...state.data,
        student: updatedStudent,
      },
    };
  }),
);
