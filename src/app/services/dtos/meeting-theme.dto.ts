import {Instructor} from "./instructor.dto";
import {Stage} from "./student.dto";

export interface MeetingThemeDto {
  id?: number;
  meetingThemeId?: number;
  date?: Date;
  hour: number;
  description: string;
  stageId?: number;
  instructorId?: number;
  stage?: Stage;
  instructor?: Instructor;
}
