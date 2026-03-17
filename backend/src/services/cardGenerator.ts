// Card generation service – produces an SVG "GitHub DNA Card"

export interface CardData {
  username: string;
  avatarUrl: string;
  name: string | null;
  topLanguages: Array<{ name: string; percentage: number; color: string }>;
  personalityScores: {
    creator: number;
    collaborator: number;
    communicator: number;
    maintainer: number;
    explorer: number;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Escape XML/SVG special characters in user-supplied strings. */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Calculate the five vertices of a radar-chart (regular pentagon) polygon
 * scaled by each score value (0–100).
 *
 * Axes start at the top and go clockwise.
 */
function radarPolygonPoints(
  cx: number,
  cy: number,
  radius: number,
  values: number[]
): string {
  return values
    .map((v, i) => {
      const angle = (i * 2 * Math.PI) / values.length - Math.PI / 2;
      const r = radius * Math.max(0, Math.min(100, v)) / 100;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    })
    .join(' ');
}

/**
 * Calculate the five vertex positions of a regular pentagon (grid lines).
 */
function pentagonPoints(cx: number, cy: number, radius: number): string {
  return Array.from({ length: 5 }, (_, i) => {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
  }).join(' ');
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

/**
 * Generate a GitHub DNA Card as an SVG string.
 *
 * Layout (1200 × 630 px, GitHub dark theme):
 *  - Left panel  (0–400 px):   avatar, display name, username, DNA label
 *  - Middle panel (400–800 px): top languages with progress bars
 *  - Right panel (800–1200 px): personality radar chart
 */
export async function generateCardData(data: CardData): Promise<string> {
  const W = 1200;
  const H = 630;

  // Colours matching GitHub dark theme
  const BG = '#0D1117';
  const PANEL_BG = '#161B22';
  const BORDER = '#30363D';
  const TEXT_PRIMARY = '#E6EDF3';
  const TEXT_SECONDARY = '#8B949E';
  const ACCENT = '#58A6FF';
  const ACCENT2 = '#3FB950';

  const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

  // Personality labels / values
  const personalityLabels = ['Creator', 'Collaborator', 'Communicator', 'Maintainer', 'Explorer'];
  const personalityValues = [
    data.personalityScores.creator,
    data.personalityScores.collaborator,
    data.personalityScores.communicator,
    data.personalityScores.maintainer,
    data.personalityScores.explorer,
  ];

  // Radar chart centre & radius (right panel)
  const radarCX = 1000;
  const radarCY = 340;
  const radarR = 130;

  // Build radar chart grid (3 concentric pentagons at 33 / 66 / 100 %)
  const radarGridLines = [33, 66, 100]
    .map(
      (pct) =>
        `<polygon points="${pentagonPoints(radarCX, radarCY, (radarR * pct) / 100)}" fill="none" stroke="${BORDER}" stroke-width="1"/>`
    )
    .join('\n    ');

  // Build radar chart axis lines
  const radarAxisLines = personalityLabels
    .map((_, i) => {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const x2 = radarCX + radarR * Math.cos(angle);
      const y2 = radarCY + radarR * Math.sin(angle);
      return `<line x1="${radarCX}" y1="${radarCY}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${BORDER}" stroke-width="1"/>`;
    })
    .join('\n    ');

  // Filled radar polygon
  const radarFilledPoints = radarPolygonPoints(radarCX, radarCY, radarR, personalityValues);

  // Radar axis labels (placed just outside each vertex)
  const LABEL_OFFSET = 20;
  const radarLabels = personalityLabels
    .map((label, i) => {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const lx = radarCX + (radarR + LABEL_OFFSET) * Math.cos(angle);
      const ly = radarCY + (radarR + LABEL_OFFSET) * Math.sin(angle);
      const anchor =
        Math.abs(Math.cos(angle)) < 0.1
          ? 'middle'
          : Math.cos(angle) > 0
          ? 'start'
          : 'end';
      const dy = Math.sin(angle) > 0.5 ? 14 : Math.sin(angle) < -0.5 ? -4 : 4;
      return `<text x="${lx.toFixed(2)}" y="${(ly + dy).toFixed(2)}" text-anchor="${anchor}" font-family="${FONT}" font-size="11" fill="${TEXT_SECONDARY}">${escapeXml(label)}</text>`;
    })
    .join('\n    ');

  // Radar vertex score labels
  const radarScoreLabels = personalityValues
    .map((v, i) => {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const r = radarR * Math.max(0, Math.min(100, v)) / 100;
      const vx = radarCX + r * Math.cos(angle);
      const vy = radarCY + r * Math.sin(angle);
      return `<circle cx="${vx.toFixed(2)}" cy="${vy.toFixed(2)}" r="3" fill="${ACCENT}"/>`;
    })
    .join('\n    ');

  // Top languages (up to 5)
  const langs = data.topLanguages.slice(0, 5);
  const langBarX = 430;
  const langBarMaxW = 310;
  const langStartY = 200;
  const langRowH = 62;

  const langRows = langs
    .map((lang, i) => {
      const barW = Math.round((langBarMaxW * Math.max(0, Math.min(100, lang.percentage))) / 100);
      const y = langStartY + i * langRowH;
      const safeColor = /^#[0-9A-Fa-f]{3,8}$/.test(lang.color) ? lang.color : ACCENT;
      return `
    <!-- Language ${i + 1}: ${escapeXml(lang.name)} -->
    <text x="${langBarX}" y="${y}" font-family="${FONT}" font-size="13" font-weight="600" fill="${TEXT_PRIMARY}">${escapeXml(lang.name)}</text>
    <text x="${langBarX + langBarMaxW}" y="${y}" text-anchor="end" font-family="${FONT}" font-size="12" fill="${TEXT_SECONDARY}">${Math.round(lang.percentage)}%</text>
    <rect x="${langBarX}" y="${y + 8}" width="${langBarMaxW}" height="8" rx="4" fill="${BORDER}"/>
    <rect x="${langBarX}" y="${y + 8}" width="${barW}" height="8" rx="4" fill="${safeColor}"/>`;
    })
    .join('');

  // Avatar image (external URL reference – works in most SVG renderers)
  const safeAvatarUrl = escapeXml(data.avatarUrl);
  const safeUsername = escapeXml(data.username);
  const safeName = escapeXml(data.name ?? data.username);

  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- Left panel -->
  <rect x="20" y="20" width="360" height="${H - 40}" rx="10" fill="${PANEL_BG}" stroke="${BORDER}" stroke-width="1"/>

  <!-- Middle panel -->
  <rect x="400" y="20" width="380" height="${H - 40}" rx="10" fill="${PANEL_BG}" stroke="${BORDER}" stroke-width="1"/>

  <!-- Right panel -->
  <rect x="800" y="20" width="380" height="${H - 40}" rx="10" fill="${PANEL_BG}" stroke="${BORDER}" stroke-width="1"/>

  <!-- ── LEFT PANEL: user info ── -->
  <!-- Avatar clip path -->
  <defs>
    <clipPath id="avatarClip">
      <circle cx="200" cy="140" r="70"/>
    </clipPath>
    <linearGradient id="dnaGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${ACCENT}"/>
      <stop offset="100%" stop-color="${ACCENT2}"/>
    </linearGradient>
  </defs>
  <circle cx="200" cy="140" r="72" fill="${BORDER}"/>
  <image href="${safeAvatarUrl}" x="130" y="68" width="140" height="140" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>

  <!-- Display name -->
  <text x="200" y="240" text-anchor="middle" font-family="${FONT}" font-size="20" font-weight="700" fill="${TEXT_PRIMARY}">${safeName}</text>

  <!-- Username -->
  <text x="200" y="265" text-anchor="middle" font-family="${FONT}" font-size="14" fill="${TEXT_SECONDARY}">@${safeUsername}</text>

  <!-- DNA label badge -->
  <rect x="130" y="285" width="140" height="28" rx="14" fill="url(#dnaGrad)"/>
  <text x="200" y="304" text-anchor="middle" font-family="${FONT}" font-size="12" font-weight="600" fill="#FFFFFF">GitHub DNA Card</text>

  <!-- Personality score summary -->
  <text x="200" y="360" text-anchor="middle" font-family="${FONT}" font-size="11" fill="${TEXT_SECONDARY}">Personality Scores</text>
  ${personalityLabels
    .map((label, i) => {
      const v = personalityValues[i];
      const dotColor = v >= 70 ? ACCENT2 : v >= 40 ? ACCENT : TEXT_SECONDARY;
      const y = 380 + i * 34;
      return `<text x="60" y="${y}" font-family="${FONT}" font-size="12" fill="${TEXT_SECONDARY}">${escapeXml(label)}</text>
  <text x="330" y="${y}" text-anchor="end" font-family="${FONT}" font-size="12" font-weight="600" fill="${dotColor}">${v}</text>
  <rect x="170" y="${y - 12}" width="130" height="7" rx="3" fill="${BORDER}"/>
  <rect x="170" y="${y - 12}" width="${Math.round(130 * v / 100)}" height="7" rx="3" fill="${dotColor}"/>`;
    })
    .join('\n  ')}

  <!-- ── MIDDLE PANEL: top languages ── -->
  <text x="590" y="75" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="700" fill="${TEXT_PRIMARY}">Top Languages</text>
  <line x1="430" y1="90" x2="760" y2="90" stroke="${BORDER}" stroke-width="1"/>
  ${langRows}

  <!-- Stacked colour bar -->
  ${(() => {
    const barY = 555;
    let xOffset = langBarX;
    return langs
      .map((lang) => {
        const segW = Math.round((langBarMaxW * Math.max(0, Math.min(100, lang.percentage))) / 100);
        const safeColor = /^#[0-9A-Fa-f]{3,8}$/.test(lang.color) ? lang.color : ACCENT;
        const seg = `<rect x="${xOffset}" y="${barY}" width="${segW}" height="10" rx="0" fill="${safeColor}"/>`;
        xOffset += segW;
        return seg;
      })
      .join('');
  })()}

  <!-- ── RIGHT PANEL: radar chart ── -->
  <text x="${radarCX}" y="75" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="700" fill="${TEXT_PRIMARY}">Personality DNA</text>
  <line x1="820" y1="90" x2="1160" y2="90" stroke="${BORDER}" stroke-width="1"/>

  <!-- Grid -->
  ${radarGridLines}

  <!-- Axes -->
  ${radarAxisLines}

  <!-- Filled area -->
  <polygon points="${radarFilledPoints}" fill="${ACCENT}" fill-opacity="0.25" stroke="${ACCENT}" stroke-width="2"/>

  <!-- Vertex dots -->
  ${radarScoreLabels}

  <!-- Labels -->
  ${radarLabels}

  <!-- Username watermark -->
  <text x="${W / 2}" y="${H - 12}" text-anchor="middle" font-family="${FONT}" font-size="11" fill="${BORDER}">github.com/${safeUsername} • Generated by GitHub DNA Visualizer</text>
</svg>`;

  return svg;
}
