import { StudentClassification } from "./student.dto"
import { UserRole } from "./user.dto"

export interface Announcement {
  id: string
  mediaUrl: string
  title?: string
  type: 'notice'| 'promotion' | 'relocation'
  targetRole: UserRole | null
  targetStudentType?: StudentClassification | null
  city?: 'Portoviejo' | 'Cuenca' | null
  isActive: boolean
  startDate?: string | null
  endDate?: string | null
  actions: Action[]
}

export interface Action {
  type: 'action' | 'close' | 'whatsapp';
  label: string
  url?: string
  color?: string;
  delaySeconds?: number;
}