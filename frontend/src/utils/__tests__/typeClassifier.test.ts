import { describe, it, expect } from 'vitest';
import { classifyDeveloperType } from '../typeClassifier';
import type { ContributionDay } from '../../types';

function makeDays(byDow: number[]): ContributionDay[] {
  // Build one week of contribution days with counts matching byDow (0=Sun…6=Sat)
  // starting from a known Sunday: 2024-01-07 (Sunday)
  const base = new Date('2024-01-07');
  return byDow.map((count, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return { date: d.toISOString().split('T')[0], contributionCount: count };
  });
}

describe('classifyDeveloperType', () => {
  it('returns balanced for empty contribution array', () => {
    const result = classifyDeveloperType([]);
    expect(result.type).toBe('balanced');
  });

  it('returns balanced when total contributions are zero', () => {
    const days = makeDays([0, 0, 0, 0, 0, 0, 0]);
    const result = classifyDeveloperType(days);
    expect(result.type).toBe('balanced');
  });

  it('returns weekend-warrior when >50% of activity is on weekends', () => {
    // Sun=10, Sat=10 (weekend=20), weekdays total=5
    const days = makeDays([10, 1, 1, 1, 1, 1, 10]);
    const result = classifyDeveloperType(days);
    expect(result.type).toBe('weekend-warrior');
  });

  it('returns early-bird when activity peaks on Mon (day 1)', () => {
    // Mon=20, rest low
    const days = makeDays([1, 20, 2, 2, 2, 2, 1]);
    const result = classifyDeveloperType(days);
    expect(result.type).toBe('early-bird');
  });

  it('returns early-bird when activity peaks on Tue (day 2)', () => {
    const days = makeDays([1, 2, 20, 2, 2, 2, 1]);
    const result = classifyDeveloperType(days);
    expect(result.type).toBe('early-bird');
  });

  it('returns night-owl when activity peaks on Thu (day 4)', () => {
    const days = makeDays([1, 2, 2, 2, 20, 2, 1]);
    const result = classifyDeveloperType(days);
    expect(result.type).toBe('night-owl');
  });

  it('returns night-owl when activity peaks on Fri (day 5)', () => {
    const days = makeDays([1, 2, 2, 2, 2, 20, 1]);
    const result = classifyDeveloperType(days);
    expect(result.type).toBe('night-owl');
  });

  it('returns all-day when activity peaks mid-week (Wed)', () => {
    const days = makeDays([1, 2, 2, 20, 2, 2, 1]);
    const result = classifyDeveloperType(days);
    expect(result.type).toBe('all-day');
  });

  it('result always has label_en and emoji', () => {
    const days = makeDays([5, 5, 5, 5, 5, 5, 5]);
    const result = classifyDeveloperType(days);
    expect(typeof result.label_en).toBe('string');
    expect(result.label_en.length).toBeGreaterThan(0);
    expect(typeof result.emoji).toBe('string');
  });
});
