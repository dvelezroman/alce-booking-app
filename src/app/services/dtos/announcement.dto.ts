import { StudentClassification } from "./student.dto"
import { UserRole } from "./user.dto"

export interface Announcement {
  id: string
  imageUrl: string
  title?: string
  type: 'promotion' | 'relocation'
  targetRole: UserRole | null
  targetStudentType?: StudentClassification | null
  city?: 'Portoviejo' | 'Cuenca' | null
  isActive: boolean
  actions: Action[]
}

export interface Action {
  type: 'interest' | 'lead' | 'link' | 'close'
  label: string
  url?: string
}