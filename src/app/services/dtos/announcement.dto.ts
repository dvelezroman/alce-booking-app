import { StudentClassification } from "./student.dto"
import { UserRole } from "./user.dto"

export type AnnouncementDisplayMode = 'modal' | 'banner' | 'both'
export type AnnouncementBannerTone = 'brand' | 'accent' | 'info' | 'warning'

/** Luxon weekday: 1 = Monday … 7 = Sunday. */
export type AnnouncementShowSchedule =
  | { kind: 'none' }
  | { kind: 'daily' }
  | { kind: 'every_n_days'; intervalDays: number }
  | { kind: 'weekly'; weekday: number }
  | {
      kind: 'monthly'
      daysOfMonth: number[]
      maxOccurrencesPerMonth?: number
    }

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
  showSchedule?: AnnouncementShowSchedule | null
  aspectRatio?: 'horizontal' | 'vertical' | 'square' | 'auto'
}

export interface Action {
  type: 'action' | 'close' | 'whatsapp';
  label: string
  url?: string
  color?: string;
  delaySeconds?: number;
}