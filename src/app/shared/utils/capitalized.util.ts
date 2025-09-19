
export function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function translateWhatsappStatus(status?: string): string {
  if (!status) return '';

  const map: Record<string, string> = {
    'available': 'Disponible',
    'at work': 'En el trabajo',
    'busy': 'Ocupado',
    'in a meeting': 'En una reunión',
    'at school': 'En clases',
    'sleeping': 'Durmiendo',
    'battery about to die': 'Batería baja',
    'urgent calls only': 'Solo llamadas urgentes',
    "hey there! i am using whatsapp": "¡Hola! Estoy usando WhatsApp",
  };

  const key = status.toLowerCase().trim();
  return map[key] || status;
}