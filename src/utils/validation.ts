import { authMessages } from '../data/authConstants';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EGYPT_PHONE_RE = /^(010|011|012|015)[0-9]{8}$/;

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return authMessages.required;
  if (!EMAIL_RE.test(value.trim())) return authMessages.invalidEmail;
  return undefined;
}

export function validateEgyptianPhone(value: string): string | undefined {
  const digits = value.replace(/\s|-/g, '');
  if (!digits.trim()) return authMessages.required;
  if (!EGYPT_PHONE_RE.test(digits)) return authMessages.invalidPhone;
  return undefined;
}

export function validateEmailOrPhone(value: string): string | undefined {
  const v = value.trim();
  if (!v) return authMessages.required;
  const digits = v.replace(/\s|-/g, '');
  if (EMAIL_RE.test(v) || EGYPT_PHONE_RE.test(digits)) return undefined;
  return authMessages.invalidEmailOrPhone;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return authMessages.required;
  if (value.length < 8) return authMessages.shortPassword;
  return undefined;
}

export function validateRequired(value: string, message = authMessages.required): string | undefined {
  if (!value || !value.trim()) return message;
  return undefined;
}

export function validateConfirmPassword(value: string, password: string): string | undefined {
  if (!value) return authMessages.required;
  if (value !== password) return authMessages.passwordMismatch;
  return undefined;
}

const ALLOWED_STUDY_SYSTEMS = ['arabic', 'languages'];

export function validateStudySystem(value: string): string | undefined {
  if (!value || !ALLOWED_STUDY_SYSTEMS.includes(value)) {
    return authMessages.studySystemRequired;
  }
  return undefined;
}
