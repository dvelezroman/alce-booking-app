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
    showMode: 'once_session',
    actions: [
      {
        type: 'action',
        label: 'Más información',
        url: '',
        color: '#d4af37'
      },
      {
        type: 'close',
        label: 'Cerrar'
      }
    ]
  },

  {
    id: '2',
    title: 'Panel administrativo actualizado',
    type: 'promotion',
    mediaUrl: 'https://www.youtube.com/watch?v=WrsCyL9Vw1k',
    targetRole: UserRole.STUDENT,
    targetStudentType: null,
    city: 'Portoviejo',
    isActive: true,
    startDate: '2026-03-01T05:00:00.000Z',
    endDate: '2026-04-30T05:00:00.000Z',
    showMode: 'once_session',
    actions: [
    
      {
        type: 'whatsapp',
        label: 'Soporte',
        url: 'https://wa.me/593999001087'
      },
      {
        type: 'close',
        label: 'Cerrar'
      }
    ]
  }
];