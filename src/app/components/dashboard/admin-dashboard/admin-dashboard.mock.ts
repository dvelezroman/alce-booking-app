import { Announcement } from "../../../services/dtos/announcement.dto";
import { UserRole } from "../../../services/dtos/user.dto";

export const ADMIN_STATS = [
  {
    label: "Total Estudiantes",
    value: "1248",
    trend: "+12%",
    icon: "users"
  },
  {
    label: "Clases Hoy",
    value: "24",
    trend: "+3",
    icon: "book-open"
  },
  {
    label: "Evaluaciones Asignadas",
    value: "18",
    trend: "-5",
    icon: "clipboard-list"
  },
  {
    label: "Notificaciones Sin Leer",
    value: "7",
    trend: "+2",
    icon: "envelope"
  }
]

export const ADMIN_MODULES = [
  {
    title: "Clases",
    // route: "/dashboard/searching-meeting",
    items: [
      { label: "Programadas hoy", value: "980" },
        { label: "En progreso", value: "12" },
        { label: "Próximas clases", value: "156" },
    ]
  },
  {
    title: "Gestión Académica",
    // route: "/dashboard/searching-students",
    items: [
        { label: "Total usuarios", value: "892" },
        { label: "Estudiantes", value: "720" },
        { label: "Instructores", value: "24" },
        { label: "Admins", value: "3" }
    ]
  },
  {
    title: "Notificaciones",
    // route: "/dashboard/notifications-status",
    items: [
        { label: "Enviadas hoy", value: "28" },
        { label: "Recibidas", value: "124" },
        { label: "Grupos activos", value: "6" }
    ]
  },
  {
    title: "Emails",
    // route: "/dashboard/historial-email",
    items: [
        { label: "Enviados hoy", value: "56" },
        { label: "Esta semana", value: "324" },
        { label: "Total enviados", value: "1248" }
    ]
  },
  {
    title: "WhatsApp",
    // route: "/dashboard/whatsapp",
    items: [
        { label: "Mensajes enviados hoy", value: "142" },
        { label: "Grupos activos", value: "8" },
        { label: "Total enviados", value: "2480" }
    ]
  },

  

]

export const ADMIN_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'admin-1',
    title: 'Panel administrativo actualizado',
    type: 'promotion',
    mediaUrl: 'https://www.youtube.com/watch?v=WrsCyL9Vw1k',
    targetRole: UserRole.ADMIN,
    targetStudentType: null,
    city: 'Portoviejo',
    isActive: true,
    startDate: '2026-03-01T05:00:00.000Z',
    endDate: '2026-04-30T05:00:00.000Z',
    actions: [
      {
        type: 'action',
        label: 'Ver panel',
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