import type { Dictionary } from "./i18n/dictionaries";

/** Deliberately permissive — the server is the real authority on deliverability. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const MIN_PASSWORD_LENGTH = 8;

export type Credentials = {
  email: string;
  password: string;
};

export type FieldErrors = Partial<Record<keyof Credentials, string>>;

export function validateCredentials(
  { email, password }: Credentials,
  t: Dictionary,
): FieldErrors {
  const errors: FieldErrors = {};

  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    errors.email = t.errors.emailRequired;
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = t.errors.emailInvalid;
  }

  if (!password) {
    errors.password = t.errors.passwordRequired;
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = t.errors.passwordShort;
  }

  return errors;
}
