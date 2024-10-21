import {UserDto} from "./user.dto";
import {Mode, Stage} from "./student.dto";
import {MeetingLinkDto} from "./booking.dto";

export interface Instructor {
  id: number;
  userId: number;
  user?: UserDto;
  meetingLink?: MeetingLinkDto
}

export interface RegisterInstructorDto {
  id?: number;
  stageId?: number;
  userId: number | null | undefined;
}

export interface RegisterInstructorResponseDto {
  id: number;
  mode: Mode;
  stageId: number;
  userId: number;
  stage: Stage;
  createdAt?: Date;
  updatedAt?: Date;
}
