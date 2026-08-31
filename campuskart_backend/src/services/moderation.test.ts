import { describe, it, expect } from 'vitest';
import { moderateText, containsContactInfo } from '../services/moderation.js';

describe('moderateText', () => {
  it('returns clean for normal text', () => {
    const result = moderateText('I have a calculator for sale');
    expect(result.isClean).toBe(true);
    expect(result.flags).toHaveLength(0);
  });

  it('flags profanity', () => {
    const result = moderateText('This is bullshit and crap');
    expect(result.isClean).toBe(false);
    expect(result.flags).toContain('profanity:bullshit');
    expect(result.flags).toContain('profanity:crap');
  });

  it('is case-insensitive', () => {
    const result = moderateText('This is BULLSHIT');
    expect(result.isClean).toBe(false);
    expect(result.flags).toContain('profanity:bullshit');
  });

  it('warns on phone numbers', () => {
    const result = moderateText('Call me at 9876543210');
    expect(result.isClean).toBe(true);
    expect(result.warnings).toContain('detected_phone:1');
  });

  it('warns on email addresses', () => {
    const result = moderateText('Email me at test@example.com');
    expect(result.isClean).toBe(true);
    expect(result.warnings).toContain('detected_email:1');
  });

  it('returns clean for empty input', () => {
    const result = moderateText('');
    expect(result.isClean).toBe(true);
    expect(result.flags).toHaveLength(0);
  });
});

describe('containsContactInfo', () => {
  it('returns false for normal text', () => {
    expect(containsContactInfo('Hello world')).toBe(false);
  });

  it('returns true for phone numbers', () => {
    expect(containsContactInfo('Call 9876543210')).toBe(true);
  });

  it('returns true for email addresses', () => {
    expect(containsContactInfo('test@example.com')).toBe(true);
  });

  it('returns false for empty input', () => {
    expect(containsContactInfo('')).toBe(false);
  });
});
