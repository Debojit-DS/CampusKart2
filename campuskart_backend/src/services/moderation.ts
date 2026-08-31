const PROFANE_WORDS = new Set([
  'abuse', 'abusive', 'asshole', 'bastard', 'bitch', 'bullshit', 'cock',
  'crap', 'cunt', 'damn', 'dick', 'dildo', 'douche', 'dumbass', 'fag',
  'faggot', 'fuck', 'fucker', 'fucking', 'gay', 'goddamn',
  'homo', 'idiot', 'jackass', 'jerk', 'kill', 'killing', 'moron',
  'nigger', 'nigga', 'piss', 'porn', 'pussy', 'rape', 'rapist', 'retard',
  'retarded', 'scum', 'shit', 'shitty', 'slut', 'stfu', 'twat', 'wank',
  'whore', 'wtf'
]);

const PHONE_REGEX = /(?:(?:\+?91|0)?[-\s.]?\(?[6-9]\d{2}\)?[-\s.]?\d{3}[-\s.]?\d{4}|(?:\+?1?[-.\s]?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}))/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const EXTERNAL_DOMAIN_REGEX = /(?:https?:\/\/)?(?:www\.)?(?!heritageit\.edu\.in)(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/gi;

export interface ModerationResult {
  isClean: boolean;
  flags: string[];
  warnings: string[];
}

export function moderateText(text: string): ModerationResult {
  if (!text) return { isClean: true, flags: [], warnings: [] };

  const lower = text.toLowerCase();
  const flags: string[] = [];
  const warnings: string[] = [];

  for (const word of PROFANE_WORDS) {
    if (lower.includes(word)) {
      flags.push(`profanity:${word}`);
    }
  }

  const phones = text.match(PHONE_REGEX);
  if (phones?.length) {
    warnings.push(`detected_phone:${phones.length}`);
  }

  const emails = text.match(EMAIL_REGEX);
  if (emails?.length) {
    warnings.push(`detected_email:${emails.length}`);
  }

  const externalLinks = text.match(EXTERNAL_DOMAIN_REGEX);
  if (externalLinks?.length) {
    warnings.push(`detected_external_link:${externalLinks.length}`);
  }

  return {
    isClean: flags.length === 0,
    flags,
    warnings
  };
}

export function containsContactInfo(text: string): boolean {
  if (!text) return false;
  return !!(text.match(PHONE_REGEX) || text.match(EMAIL_REGEX));
}
