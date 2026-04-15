import { describe, it, expect } from 'vitest';
import { getLanguageColor, GITHUB_LANGUAGE_COLORS } from '../githubColors';

describe('getLanguageColor', () => {
  it('returns correct color for TypeScript', () => {
    expect(getLanguageColor('TypeScript')).toBe('#3178c6');
  });

  it('returns correct color for JavaScript', () => {
    expect(getLanguageColor('JavaScript')).toBe('#f1e05a');
  });

  it('returns correct color for Python', () => {
    expect(getLanguageColor('Python')).toBe('#3572A5');
  });

  it('returns the default color for an unknown language', () => {
    expect(getLanguageColor('UnknownLang123')).toBe(GITHUB_LANGUAGE_COLORS.default);
  });

  it('default color is a valid hex string', () => {
    expect(GITHUB_LANGUAGE_COLORS.default).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('returns the default color for an empty string', () => {
    expect(getLanguageColor('')).toBe(GITHUB_LANGUAGE_COLORS.default);
  });
});
