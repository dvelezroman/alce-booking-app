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
export type MonthKey = "ENERO" | "FEBRERO" | "MARZO" |
 "ABRIL" | "MAYO" | "JUNIO" | "JULIO" | "AGOSTO" | 
 "SEPTIEMBRE" | "OCTUBRE" | "NOVIEMBRE" | "DICIEMBRE";