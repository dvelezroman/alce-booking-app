
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
  assignedBy?: { id: number; firstName: string; lastName: string } | null; 
  markAssistanceByUser?: { id: number; firstName: string; lastName: string } | null;  
}

export type MonthKey = "ENERO" | "FEBRERO" | "MARZO" |
 "ABRIL" | "MAYO" | "JUNIO" | "JULIO" | "AGOSTO" | 
 "SEPTIEMBRE" | "OCTUBRE" | "NOVIEMBRE" | "DICIEMBRE";