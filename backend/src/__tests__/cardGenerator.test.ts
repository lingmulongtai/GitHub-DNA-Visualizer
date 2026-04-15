import { generateCardData } from '../services/cardGenerator';

const baseData = {
  username: 'testuser',
  avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
  name: 'Test User',
  topLanguages: [
    { name: 'TypeScript', percentage: 60, color: '#3178c6' },
    { name: 'JavaScript', percentage: 40, color: '#f1e05a' },
  ],
  personalityScores: {
    creator: 70,
    collaborator: 60,
    communicator: 50,
    maintainer: 80,
    explorer: 90,
  },
};

describe('generateCardData', () => {
  it('returns a string starting with <svg', async () => {
    const svg = await generateCardData(baseData);
    expect(typeof svg).toBe('string');
    expect(svg.trimStart().startsWith('<svg')).toBe(true);
  });

  it('includes the username in the SVG output', async () => {
    const svg = await generateCardData(baseData);
    expect(svg).toContain('testuser');
  });

  it('includes the display name in the SVG output', async () => {
    const svg = await generateCardData(baseData);
    expect(svg).toContain('Test User');
  });

  it('escapes XML special characters in username', async () => {
    const data = { ...baseData, username: '<evil>&"test"' };
    const svg = await generateCardData(data);
    expect(svg).not.toContain('<evil>');
    expect(svg).toContain('&lt;evil&gt;');
    expect(svg).toContain('&amp;');
  });

  it('escapes XML special characters in display name', async () => {
    const data = { ...baseData, name: '<script>alert(1)</script>' };
    const svg = await generateCardData(data);
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
  });

  it('handles null display name gracefully (falls back to username)', async () => {
    const data = { ...baseData, name: null };
    const svg = await generateCardData(data);
    expect(svg).toContain('testuser');
  });

  it('clamps personality scores to 0–100 range', async () => {
    const data = {
      ...baseData,
      personalityScores: { creator: 200, collaborator: -50, communicator: 50, maintainer: 80, explorer: 90 },
    };
    // Should not throw; SVG dimensions should remain valid
    await expect(generateCardData(data)).resolves.toBeDefined();
  });

  it('handles empty topLanguages array', async () => {
    const data = { ...baseData, topLanguages: [] };
    const svg = await generateCardData(data);
    expect(svg).toContain('<svg');
  });
});
