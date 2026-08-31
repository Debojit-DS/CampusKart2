const resetTokens = new Map<string, { email: string; expiresAt: number }>();

const TOKEN_EXPIRY_MS = 60 * 60 * 1000;

export function storeResetToken(token: string, email: string) {
  resetTokens.set(token, { email, expiresAt: Date.now() + TOKEN_EXPIRY_MS });
}

export function validateResetToken(token: string): string | null {
  const entry = resetTokens.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    resetTokens.delete(token);
    return null;
  }
  return entry.email;
}

export function consumeResetToken(token: string) {
  resetTokens.delete(token);
}
