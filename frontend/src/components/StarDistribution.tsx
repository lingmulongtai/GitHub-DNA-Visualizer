import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { GitHubRepo } from '../types';
import { getLanguageColor } from '../utils/githubColors';
import { TranslationKey, translations } from '../i18n';

interface StarDistributionProps {
  repos: GitHubRepo[];
  lang: 'ja' | 'en';
}

function t(lang: 'ja' | 'en', key: TranslationKey): string {
  return translations[lang][key];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: GitHubRepo & { displayName: string } }>;
  lang: 'ja' | 'en';
}

function CustomTooltip({ active, payload, lang }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const repo = payload[0].payload;
  return (
    <div className="bg-gh-elevated border border-white/[0.12] rounded-lg p-3 max-w-xs text-xs">
      <p className="text-gh-text font-medium">{repo.name}</p>
      {repo.description && <p className="text-gh-muted mt-1">{repo.description}</p>}
      <div className="mt-2 flex items-center gap-2">
        {repo.language && (
          <span
            className="px-2 py-0.5 rounded"
            style={{
              background: `${getLanguageColor(repo.language)}26`,
              color: getLanguageColor(repo.language),
            }}
          >
            {repo.language}
          </span>
        )}
        <span className="text-gh-subtle font-mono">
          {lang === 'ja' ? '更新:' : 'Updated:'} {new Date(repo.updated_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

export function StarDistribution({ repos, lang }: StarDistributionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const top10 = repos
    .filter(r => r.stargazers_count > 0)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10)
    .map(r => ({ ...r, displayName: r.name }));

  if (top10.length === 0) {
    return (
      <section className="bg-gh-surface border border-white/[0.08] rounded-xl p-6">
        <h3 className="text-base font-medium text-gh-text mb-2">{t(lang, 'starSection')}</h3>
        <p className="text-gh-muted text-sm">{lang === 'ja' ? 'スター付きリポジトリがありません。' : 'No starred repositories found.'}</p>
      </section>
    );
  }

  return (
    <section className="bg-gh-surface border border-white/[0.08] rounded-xl p-6">
      <h3 className="text-base font-medium text-gh-text mb-5">{t(lang, 'starSection')}</h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top10} layout="vertical" margin={{ left: 16, right: 24, top: 0, bottom: 0 }}>
            <XAxis
              type="number"
              tick={{ fill: '#9898a0', fontSize: 11 }}
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="displayName"
              tick={{ fill: '#f2f2f3', fontSize: 11 }}
              width={110}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip lang={lang} />} />
            <Bar
              dataKey="stargazers_count"
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
              onMouseEnter={(_: unknown, index: number) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {top10.map((_, index) => (
                <Cell key={`cell-${index}`} fill={hoveredIndex === index ? '#ededed' : '#38bdf8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
