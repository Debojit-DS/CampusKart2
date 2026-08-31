const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

const CODE_EXPIRY_MS = 15 * 60 * 1000;

export function storeVerificationCode(email: string, code: string) {
  verificationCodes.set(email, { code, expiresAt: Date.now() + CODE_EXPIRY_MS });
}

export function validateVerificationCode(email: string, code: string): boolean {
  const entry = verificationCodes.get(email);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    verificationCodes.delete(email);
    return false;
  }
  const valid = entry.code === code;
  if (valid) {
    verificationCodes.delete(email);
  }
  return valid;
}
