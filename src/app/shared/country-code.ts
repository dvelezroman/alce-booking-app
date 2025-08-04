export interface CountryCode {
  name: string;
  code: string; 
  iso: string;  
}

export const COUNTRY_CODES: CountryCode[] = [
  { name: 'Ecuador', code: '+593', iso: 'EC' },
  { name: 'Estados Unidos', code: '+1', iso: 'US' },
  { name: 'Colombia', code: '+57', iso: 'CO' },
  { name: 'Perú', code: '+51', iso: 'PE' },
  { name: 'México', code: '+52', iso: 'MX' },
  { name: 'Argentina', code: '+54', iso: 'AR' },
  { name: 'Chile', code: '+56', iso: 'CL' },
  { name: 'Brasil', code: '+55', iso: 'BR' },
  { name: 'Bolivia', code: '+591', iso: 'BO' },
  { name: 'Uruguay', code: '+598', iso: 'UY' },
  { name: 'Paraguay', code: '+595', iso: 'PY' },
  { name: 'Venezuela', code: '+58', iso: 'VE' },
  { name: 'España', code: '+34', iso: 'ES' },
  { name: 'Canadá', code: '+1', iso: 'CA' },
  { name: 'Reino Unido', code: '+44', iso: 'GB' },
  { name: 'Italia', code: '+39', iso: 'IT' },
  { name: 'Francia', code: '+33', iso: 'FR' },
  { name: 'Alemania', code: '+49', iso: 'DE' },
  { name: 'Portugal', code: '+351', iso: 'PT' },
  { name: 'Japón', code: '+81', iso: 'JP' },
  { name: 'Corea del Sur', code: '+82', iso: 'KR' },
  { name: 'China', code: '+86', iso: 'CN' },
];

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  EC: ['Quito', 'Guayaquil', 'Cuenca', 'Portoviejo'],
  US: ['New York', 'Los Angeles', 'Miami', 'Chicago'],
  CO: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla'],
  PE: ['Lima', 'Arequipa', 'Cusco', 'Trujillo'],
  MX: ['Ciudad de México', 'Guadalajara', 'Monterrey'],
  AR: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza'],
  CL: ['Santiago', 'Valparaíso', 'Concepción'],
  BR: ['São Paulo', 'Río de Janeiro', 'Brasilia'],
  BO: ['La Paz', 'Santa Cruz', 'Cochabamba'],
  UY: ['Montevideo', 'Punta del Este'],
  PY: ['Asunción', 'Ciudad del Este'],
  VE: ['Caracas', 'Maracaibo'],
  ES: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla'],
  CA: ['Toronto', 'Vancouver', 'Montreal'],
  GB: ['Londres', 'Manchester', 'Liverpool'],
  IT: ['Roma', 'Milán', 'Nápoles'],
  FR: ['París', 'Lyon', 'Marsella'],
  DE: ['Berlín', 'Múnich', 'Hamburgo'],
  PT: ['Lisboa', 'Oporto'],
  JP: ['Tokio', 'Osaka', 'Kioto'],
  KR: ['Seúl', 'Busan'],
  CN: ['Pekín', 'Shanghái', 'Cantón'],
};