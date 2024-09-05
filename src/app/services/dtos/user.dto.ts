export enum UserRole {
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

export interface UserDto {
  idNumber: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthday: string;
  role: UserRole;
  status?: boolean;
  register?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export type UserWithoutPasswordDto = Omit<UserDto, 'password'>;

export interface LoginResponseDto extends UserWithoutPasswordDto {
  accessToken: string;
}

export interface RegisterResponseDto {
  message: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    birthday: string;
    role: UserRole;
  };
}
