
import {Stage} from "./student.dto";
import {MeetingDTO} from "./booking.dto";

export interface MeetingThemeDto {
  id?: number;
  meetingThemeId?: number;
  date?: Date;
  hour: number;
  description: string;
  stageId?: number;
  instructorId?: number;
  stage?: Stage;
  studentId?: number;
  //report_detailed
  student?: { name: string; email: string; stage: string; };
  instructor?: { name: string; };
  _count?: { _all: number; };
  //report_statistical
  total?: number;
  present?: number;
  absent?: number;
  cancelled?: number;
  present_percentage?: number;
  absent_percentage?: number;
  cancelled_percentage?: number;
  //reporte_clases
  meetings?: Meeting[];
}

export interface Meeting {
  id: number;
  date: string;
  hour: number;
  present: boolean;
  mode: string;
  instructor?: { user: { id: number; firstName: string; lastName: string } };
  assignedBy?: { id: number; firstName: string; lastName: string } | null;
  markAssistanceByUser?: { id: number; firstName: string; lastName: string } | null;
}

export interface MeetingReportDetailed {
  instructor_name: string;
  stage_description: string;
  student_name: string;
  total_absent: number;
  total_present: number;
  total_meetings: number;
  username: string;
}

export interface StatisticalDataI {
  absent: number;
  absent_percentage: number;
  cancelled_percentage: number;
  cancelled: number
  present: number;
  present_percentage: number;
  total: number;
}

export interface MeetingDataI extends MeetingDTO {

}

export type MonthKey = "ENERO" | "FEBRERO" | "MARZO" |
 "ABRIL" | "MAYO" | "JUNIO" | "JULIO" | "AGOSTO" |
 "SEPTIEMBRE" | "OCTUBRE" | "NOVIEMBRE" | "DICIEMBRE";
