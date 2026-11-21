import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from 'recharts';
import { PersonalityScores } from '../types';
import { TranslationKey, translations } from '../i18n';

interface PersonalityRadarProps {
  scores: PersonalityScores;
  lang: 'ja' | 'en';
  username?: string;
}

function t(lang: 'ja' | 'en', key: TranslationKey): string {
  return translations[lang][key];
}

export function PersonalityRadar({ scores, lang, username }: PersonalityRadarProps) {
  const data = [
    { subject: t(lang, 'creator'), value: scores.creator, fullMark: 100 },
    { subject: t(lang, 'collaborator'), value: scores.collaborator, fullMark: 100 },
    { subject: t(lang, 'communicator'), value: scores.communicator, fullMark: 100 },
    { subject: t(lang, 'maintainer'), value: scores.maintainer, fullMark: 100 },
    { subject: t(lang, 'explorer'), value: scores.explorer, fullMark: 100 },
  ];

  const topTrait = data.reduce((a, b) => a.value > b.value ? a : b);

  return (
    <section className="bg-gh-surface border border-white/[0.08] rounded-xl p-6">
      <div className="mb-4">
        <h3 className="text-base font-medium text-gh-text">{t(lang, 'personalitySection')}</h3>
        {username && (
          <p className="text-gh-muted text-xs mt-1">
            {lang === 'ja'
              ? `@${username} の開発スタイルは「${topTrait.subject}」が最も高い傾向です`
              : `@${username} scores highest on ${topTrait.subject}`}
          </p>
        )}
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9898a0', fontSize: 12 }} />
            <Radar
              name={username ?? 'User'}
              dataKey="value"
              stroke="#38bdf8"
              fill="#38bdf8"
              fillOpacity={0.18}
              isAnimationActive={false}
            />
            <Tooltip
              contentStyle={{ background: '#19191b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value: number) => [`${value}/100`, '']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
        {data.map(item => (
          <div key={item.subject} className="text-center p-2.5 bg-gh-elevated border border-white/[0.06] rounded-lg">
            <div className="text-base font-medium font-mono text-gh-text">{item.value}</div>
            <div className="text-xs text-gh-muted mt-0.5">{item.subject}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
