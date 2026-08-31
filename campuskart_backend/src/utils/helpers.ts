export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

export function generateRandomToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function extractEmailDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() || '';
}

export function isValidEducationalEmail(email: string): boolean {
  const domain = extractEmailDomain(email);
  const eduPatterns = ['.edu', '.ac.', '.edu.in', '.ac.in', '.org'];
  return eduPatterns.some(pattern => domain.includes(pattern));
}
