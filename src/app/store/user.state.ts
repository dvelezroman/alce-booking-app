// src/app/store/user.state.ts
import {UserDto} from "../services/dtos/user.dto";

export interface UserState {
  isAdmin: boolean;
  isLoggedIn: boolean;
  data: UserDto | null;
}
