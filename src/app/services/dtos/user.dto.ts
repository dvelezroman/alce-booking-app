import {Stage, Student} from "./student.dto";
import {Instructor} from "./instructor.dto";
import { AssessmentResourceI } from "./assessment-resources.dto";

export enum UserRole {
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  HOLD = 'HOLD',
}

export interface UserDto {
  id: number;
  idNumber?: string;
  email: string;
  emailAddress?: string;
  contact?: string;
  country?: string;
  city?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  birthday?: string;
  role?: UserRole;
  register?: boolean;
  student?: Student;
  stage?: Stage;
  instructor?: Instructor;
  comment?: string;
  status?: UserStatus;
  meetingsAlert?: boolean;
  assessmentResources?: AssessmentResourceI[];
  dataCompleted?: boolean;
  temporaryComment?: string;
  createdAt?: string;
  updatedAt?: string;
  occupation?: string; 
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

export interface UsersResponse {
  page: number;
  count: number;
  totalCount: number;
  users: UserDto[];
}
