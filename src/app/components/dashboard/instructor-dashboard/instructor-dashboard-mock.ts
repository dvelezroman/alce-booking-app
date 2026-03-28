import { Announcement } from '../../../services/dtos/announcement.dto';
import { UserRole } from '../../../services/dtos/user.dto';

export const INSTRUCTOR_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'instructor-1',
    title: 'Actualización de agenda',
    type: 'notice',
    mediaUrl: 'https://www.youtube.com/watch?v=hD-tmbu2z_g&list=PLRY34nebP5a2UmEg-6dYPxjQ-nmOEe7Mj',
    targetRole: UserRole.INSTRUCTOR,
    targetStudentType: null,
    city: null,
    isActive: true,
    startDate: '2026-03-01T05:00:00.000Z',
    endDate: '2026-04-30T05:00:00.000Z',
    actions: [
      {
        type: 'action',
        label: 'Ver agenda',
        url: '',
        color: '#28336f'
      },
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