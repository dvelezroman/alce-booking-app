import { Announcement } from "../../../services/dtos/announcement.dto";
import { UserRole } from "../../../services/dtos/user.dto";

 export const STUDENT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'Aviso de clases',
    type: 'notice',
    mediaUrl: 'https://www.youtube.com/watch?v=IsmkAHWutEk',
    targetRole: UserRole.STUDENT,
    targetStudentType: null,
    city: 'Portoviejo',
    isActive: true,
    startDate: '2026-03-01T05:00:00.000Z',
    endDate: '2026-04-30T05:00:00.000Z',
    showMode: 'always',
    actions: [
      {
        type: 'action',
        label: 'Más información',
        url: '',
        color: '#d4af37',
        delaySeconds: 10
      },
      {
        type: 'close',
        label: 'Cerrar',
        delaySeconds: 10
      }
    ]
  },

  {
    id: '2',
    title: 'Panel administrativo actualizado',
    type: 'promotion',
    mediaUrl: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=1200&auto=format&fit=crop',
    targetRole: UserRole.STUDENT,
    targetStudentType: null,
    city: 'Portoviejo',
    isActive: true,
    startDate: '2026-03-01T05:00:00.000Z',
    endDate: '2026-04-30T05:00:00.000Z',
    showMode: 'always',
    actions: [
      {
        type: 'whatsapp',
        label: 'Soporte',
        url: 'https://wa.me/593999001087',
        delaySeconds: 10
      },
      {
        type: 'close',
        label: 'Cerrar',
        delaySeconds: 10
      }
    ]
  }
];