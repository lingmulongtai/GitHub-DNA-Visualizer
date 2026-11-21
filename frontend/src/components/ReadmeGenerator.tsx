import { useState } from 'react';
import { GitHubData, PersonalityScores } from '../types';

interface ReadmeGeneratorProps {
  data: GitHubData;
  scores: PersonalityScores;
  lang: 'ja' | 'en';
}

export function ReadmeGenerator({ data, scores, lang }: ReadmeGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { user } = data;
  const topLangs = Object.entries(data.languageStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name]) => name);

  const readme = `# ${user.name ?? user.login}

${user.bio ?? ''}

## Development overview

- Location: ${user.location ?? 'Not specified'}
- Organization: ${user.company ?? 'Independent'}
- Public repositories: ${user.public_repos}
- Total stars: ${data.repos.reduce((sum, r) => sum + r.stargazers_count, 0)}

## Top languages

${topLangs.map(l => `- ${l}`).join('\n')}

## Personality scores

| Trait | Score |
|-------|-------|
| Creator | ${scores.creator}/100 |
| Collaborator | ${scores.collaborator}/100 |
| Communicator | ${scores.communicator}/100 |
| Maintainer | ${scores.maintainer}/100 |
| Explorer | ${scores.explorer}/100 |
`;

  return (
    <div className="flex-1 min-w-[200px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-10 items-center gap-2 px-4 text-sm font-medium border border-white/[0.12] bg-gh-surface text-gh-text rounded-lg hover:border-white/25 transition-colors"
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
        {lang === 'ja' ? 'README を生成' : 'Generate README'}
      </button>

      {isOpen && (
        <div className="mt-3 bg-gh-surface border border-white/[0.08] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gh-muted text-xs font-mono">README.md</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(readme)
                  .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  })
                  .catch(() => {});
              }}
              className="text-xs font-medium text-gh-blue hover:underline"
              type="button"
            >
              {copied ? (lang === 'ja' ? 'コピー済み' : 'Copied') : (lang === 'ja' ? 'コピー' : 'Copy')}
            </button>
          </div>
          <pre className="text-gh-muted text-xs overflow-auto max-h-64 font-mono whitespace-pre-wrap">
            {readme}
          </pre>
        </div>
      )}
    </div>
  );
}
