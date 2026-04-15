import { describe, it, expect } from 'vitest';
import { calculatePersonalityScores } from '../scoreCalculator';
import type { GitHubData } from '../../types';

function makeData(overrides: Partial<{
  repos: GitHubData['repos'];
  contributions: GitHubData['contributions'];
  graphqlRepos: GitHubData['graphqlRepos'];
}>): GitHubData {
  return {
    user: { login: 'test', name: null, bio: null, avatar_url: '', followers: 0, following: 0, location: null, company: null, blog: null, public_repos: 0, created_at: '', updated_at: '' },
    repos: overrides.repos ?? [],
    events: [],
    languageStats: {},
    contributions: overrides.contributions ?? {
      contributionCalendar: { totalContributions: 0, weeks: [] },
      totalCommitContributions: 0,
      totalPullRequestContributions: 0,
      totalIssueContributions: 0,
    },
    graphqlRepos: overrides.graphqlRepos ?? [],
    rateLimit: { remaining: null, limit: null, reset: null },
  };
}

const recentDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
const oldDate = new Date('2020-01-01').toISOString();

describe('calculatePersonalityScores', () => {
  it('returns all zeros for empty data', () => {
    const scores = calculatePersonalityScores(makeData({}));
    expect(scores.creator).toBe(0);
    expect(scores.collaborator).toBe(0);
    expect(scores.communicator).toBe(0);
    expect(scores.maintainer).toBe(0);
    expect(scores.explorer).toBe(0);
  });

  it('all scores are in range 0–100', () => {
    const data = makeData({
      repos: [
        { name: 'r1', fork: false, language: 'TypeScript', stargazers_count: 10, forks_count: 0, description: null, created_at: recentDate, updated_at: recentDate, html_url: '' },
        { name: 'r2', fork: true, language: 'JavaScript', stargazers_count: 0, forks_count: 0, description: null, created_at: oldDate, updated_at: oldDate, html_url: '' },
      ],
      contributions: {
        contributionCalendar: { totalContributions: 100, weeks: [] },
        totalCommitContributions: 300,
        totalPullRequestContributions: 50,
        totalIssueContributions: 20,
      },
      graphqlRepos: [{ name: 'r1', stargazerCount: 10, forkCount: 5, primaryLanguage: null, createdAt: '', updatedAt: '', description: null }],
    });
    const scores = calculatePersonalityScores(data);
    for (const key of ['creator', 'collaborator', 'communicator', 'maintainer', 'explorer'] as const) {
      expect(scores[key]).toBeGreaterThanOrEqual(0);
      expect(scores[key]).toBeLessThanOrEqual(100);
    }
  });

  it('creator score is 100 when all repos are original (non-fork)', () => {
    const data = makeData({
      repos: [
        { name: 'r1', fork: false, language: 'Go', stargazers_count: 0, forks_count: 0, description: null, created_at: oldDate, updated_at: oldDate, html_url: '' },
        { name: 'r2', fork: false, language: 'Python', stargazers_count: 0, forks_count: 0, description: null, created_at: oldDate, updated_at: oldDate, html_url: '' },
      ],
    });
    const scores = calculatePersonalityScores(data);
    expect(scores.creator).toBe(100);
  });

  it('creator score is 0 when all repos are forks', () => {
    const data = makeData({
      repos: [
        { name: 'r1', fork: true, language: 'Go', stargazers_count: 0, forks_count: 0, description: null, created_at: oldDate, updated_at: oldDate, html_url: '' },
      ],
    });
    const scores = calculatePersonalityScores(data);
    expect(scores.creator).toBe(0);
  });

  it('explorer score reflects language diversity', () => {
    const langs = ['TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C', 'C++', 'Ruby', 'Swift', 'Kotlin'];
    const data = makeData({
      repos: langs.map((lang, i) => ({
        name: `r${i}`, fork: false, language: lang, stargazers_count: 0, forks_count: 0,
        description: null, created_at: oldDate, updated_at: oldDate, html_url: '',
      })),
    });
    const scores = calculatePersonalityScores(data);
    expect(scores.explorer).toBe(100); // 10 unique languages → max score
  });

  it('communicator score is proportional to issue contributions', () => {
    const low = makeData({ contributions: { contributionCalendar: { totalContributions: 0, weeks: [] }, totalCommitContributions: 0, totalPullRequestContributions: 0, totalIssueContributions: 100 } });
    const high = makeData({ contributions: { contributionCalendar: { totalContributions: 0, weeks: [] }, totalCommitContributions: 0, totalPullRequestContributions: 0, totalIssueContributions: 200 } });
    expect(calculatePersonalityScores(high).communicator).toBeGreaterThan(calculatePersonalityScores(low).communicator);
  });

  it('maintainer score improves with more recent repo updates', () => {
    const noRecent = makeData({
      repos: [{ name: 'r1', fork: false, language: 'JS', stargazers_count: 0, forks_count: 0, description: null, created_at: oldDate, updated_at: oldDate, html_url: '' }],
    });
    const withRecent = makeData({
      repos: [{ name: 'r1', fork: false, language: 'JS', stargazers_count: 0, forks_count: 0, description: null, created_at: recentDate, updated_at: recentDate, html_url: '' }],
    });
    expect(calculatePersonalityScores(withRecent).maintainer).toBeGreaterThan(calculatePersonalityScores(noRecent).maintainer);
  });
});
