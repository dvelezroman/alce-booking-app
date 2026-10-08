import { StudentClassification } from "./student.dto"
import { UserRole } from "./user.dto"

export type AnnouncementDisplayMode = 'modal' | 'banner' | 'both'
export type AnnouncementBannerTone = 'brand' | 'accent' | 'info' | 'warning'

export interface Announcement {
  id: string
  mediaUrl: string
  title?: string
  message?: string
  type: 'notice'| 'promotion' | 'relocation'
  displayMode?: AnnouncementDisplayMode
  bannerTone?: AnnouncementBannerTone
  targetRole: UserRole | null
  targetStudentType?: StudentClassification | null
  city?: 'Portoviejo' | 'Cuenca' | null
  isActive: boolean
  startDate?: string | null
  endDate?: string | null
  actions: Action[]
  showMode?: 'always' | 'once_session' | 'once_user'
  aspectRatio?: 'horizontal' | 'vertical' | 'square' | 'auto'
}

export interface Action {
  type: 'action' | 'close' | 'whatsapp';
  label: string
  url?: string
  color?: string;
  delaySeconds?: number;
}