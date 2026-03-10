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