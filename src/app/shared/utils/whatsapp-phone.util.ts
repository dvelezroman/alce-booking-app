import { UserDto } from '../../services/dtos/user.dto';

const DEFAULT_DIAL = '+593';
const E164_PATTERN = /^\+\d{10,15}$/;

function stripNationalTrunk(dial: string, digits: string): string {
  if (dial === '+593' && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

function parsePhoneParts(value: string): { dial: string; national: string } {
  const v = value.trim();
  if (!v) {
    return { dial: DEFAULT_DIAL, national: '' };
  }

  const compact = v.replace(/[\s\-().]/g, '');

  if (compact.startsWith('+')) {
    const allDigits = compact.slice(1).replace(/\D/g, '');
    if (compact.startsWith('+593')) {
      const national = stripNationalTrunk('+593', allDigits.slice(3));
      return { dial: '+593', national };
    }
    if (compact.startsWith('+57') && allDigits.length > 2) {
      return { dial: '+57', national: allDigits.slice(2) };
    }
    if (allDigits.length >= 10) {
      return { dial: `+${allDigits.slice(0, 3)}`, national: allDigits.slice(3) };
    }
    return {
      dial: DEFAULT_DIAL,
      national: stripNationalTrunk(DEFAULT_DIAL, allDigits),
    };
  }

  const digits = compact.replace(/\D/g, '');
  return {
    dial: DEFAULT_DIAL,
    national: stripNationalTrunk(DEFAULT_DIAL, digits),
  };
}

/**
 * Normaliza teléfono a E.164 con prefijo + (ej. +593995710556).
 * Quita el 0 inicial al unir con código de país Ecuador por defecto.
 */
export function normalizeWhatsappPhone(
  raw: string | undefined | null,
  defaultCountryCode = DEFAULT_DIAL,
): string | null {
  if (!raw?.trim()) {
    return null;
  }

  const { dial, national } = parsePhoneParts(raw);
  const useDial = raw.trim().startsWith('+') ? dial : defaultCountryCode;
  let nationalDigits = national.replace(/\D/g, '');
  nationalDigits = stripNationalTrunk(useDial, nationalDigits);

  if (!nationalDigits || nationalDigits.length < 8) {
    return null;
  }

  const dialDigits = useDial.replace(/\D/g, '');
  const e164 = `+${dialDigits}${nationalDigits}`;

  return E164_PATTERN.test(e164) ? e164 : null;
}

export function getStudentDisplayContact(user: UserDto): string {
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return name || user.email || 'Estudiante';
}

export interface StudentRecipient {
  user: UserDto;
  phone: string | null;
  contactName: string;
}

export function mapStudentToRecipient(user: UserDto): StudentRecipient {
  return {
    user,
    phone: normalizeWhatsappPhone(user.contact),
    contactName: getStudentDisplayContact(user),
  };
}
