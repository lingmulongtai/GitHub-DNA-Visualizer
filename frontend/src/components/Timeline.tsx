import {
  ComposedChart, Line, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';
import { GitHubRepo } from '../types';
import { TranslationKey, translations } from '../i18n';

interface TimelineProps {
  repos: GitHubRepo[];
  lang: 'ja' | 'en';
}

function t(lang: 'ja' | 'en', key: TranslationKey): string {
  return translations[lang][key];
}

export function Timeline({ repos, lang }: TimelineProps) {
  const yearMap = new Map<number, { reposCreated: number; starsEarned: number; cumulative: number }>();

  for (const repo of repos) {
    const year = new Date(repo.created_at).getFullYear();
    const existing = yearMap.get(year) ?? { reposCreated: 0, starsEarned: 0, cumulative: 0 };
    yearMap.set(year, {
      reposCreated: existing.reposCreated + 1,
      starsEarned: existing.starsEarned + repo.stargazers_count,
      cumulative: 0,
    });
  }

  const years = Array.from(yearMap.entries()).sort(([a], [b]) => a - b);

  let cumulative = 0;
  const data = years.map(([year, stats]) => {
    cumulative += stats.reposCreated;
    return {
      year: String(year),
      [t(lang, 'reposCreated')]: stats.reposCreated,
      [t(lang, 'starsEarned')]: stats.starsEarned,
      cumulative,
    };
  });

  if (data.length === 0) {
    return (
      <section className="bg-gh-surface border border-white/[0.08] rounded-xl p-6">
        <h3 className="text-base font-medium text-gh-text mb-2">{t(lang, 'timelineSection')}</h3>
        <p className="text-gh-muted text-sm">{lang === 'ja' ? 'データがありません。' : 'No data available.'}</p>
      </section>
    );
  }

  const reposCreatedKey = t(lang, 'reposCreated');
  const starsEarnedKey = t(lang, 'starsEarned');

  return (
    <section className="bg-gh-surface border border-white/[0.08] rounded-xl p-6">
      <h3 className="text-base font-medium text-gh-text mb-5">{t(lang, 'timelineSection')}</h3>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#9898a0', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fill: '#9898a0', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9898a0', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#19191b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', fontSize: '12px' }}
            />
            <Legend formatter={(value) => <span style={{ color: '#9898a0', fontSize: '12px' }}>{value}</span>} />
            <Bar yAxisId="left" dataKey={reposCreatedKey} fill="#38bdf8" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar yAxisId="right" dataKey={starsEarnedKey} fill="#52525b" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cumulative"
              stroke="#ededed"
              strokeWidth={1.75}
              dot={false}
              isAnimationActive={false}
              name={lang === 'ja' ? '累計リポジトリ数' : 'Cumulative repos'}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
