import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ContributionCalendar } from '../types';
import { classifyDeveloperType } from '../utils/typeClassifier';
import { TranslationKey, translations } from '../i18n';

interface ActivityHeatmapProps {
  calendar: ContributionCalendar;
  lang: 'ja' | 'en';
}

function t(lang: 'ja' | 'en', key: TranslationKey): string {
  return translations[lang][key];
}

function getHeatmapColor(count: number, max: number): string {
  if (count === 0) return '#19191b';
  const ratio = count / Math.max(max, 1);
  if (ratio < 0.25) return '#0c4a6e';
  if (ratio < 0.5) return '#0369a1';
  if (ratio < 0.75) return '#0284c7';
  return '#38bdf8';
}

export function ActivityHeatmap({ calendar, lang }: ActivityHeatmapProps) {
  const allDays = calendar.weeks.flatMap(w => w.contributionDays);
  const maxCount = Math.max(...allDays.map(d => d.contributionCount), 1);

  const dayOfWeekLabels = lang === 'ja'
    ? ['日', '月', '火', '水', '木', '金', '土']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const byDayOfWeek = dayOfWeekLabels.map((label, i) => ({
    name: label,
    count: allDays
      .filter(d => new Date(d.date).getDay() === i)
      .reduce((sum, d) => sum + d.contributionCount, 0),
  }));

  const developerType = classifyDeveloperType(allDays);
  const typeLabel = lang === 'ja' ? developerType.label_ja : developerType.label_en;
  const typeDesc = lang === 'ja' ? developerType.description_ja : developerType.description_en;
  const recentWeeks = calendar.weeks.slice(-26);

  return (
    <section className="bg-gh-surface border border-white/[0.08] rounded-xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-medium text-gh-text">{t(lang, 'activitySection')}</h3>
          <p className="text-xs text-gh-muted mt-1">{typeLabel} — {typeDesc}</p>
        </div>
        {calendar.weeks.length > 0 && (
          <div className="text-right">
            <div className="font-mono text-base font-medium text-gh-text">
              {calendar.totalContributions.toLocaleString()}
            </div>
            <div className="text-xs text-gh-muted">{t(lang, 'totalContributions')}</div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto mb-6">
        {calendar.weeks.length > 0 ? (
          <div className="flex gap-1">
            {recentWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.contributionDays.map((day, di) => (
                  <div
                    key={di}
                    className="w-3 h-3 rounded-[2px] border border-white/[0.04]"
                    style={{ background: getHeatmapColor(day.contributionCount, maxCount) }}
                    title={`${day.date}: ${day.contributionCount} contributions`}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gh-muted text-sm">
            {lang === 'ja' ? 'コントリビューションデータを取得するには GitHub Token が必要です。' : 'GitHub Token required to fetch contribution data.'}
          </p>
        )}
      </div>

      <div className="h-44">
        <p className="text-gh-muted text-xs mb-2">{lang === 'ja' ? '曜日別活動量' : 'Activity by day of week'}</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byDayOfWeek}>
            <XAxis dataKey="name" tick={{ fill: '#9898a0', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9898a0', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#19191b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', fontSize: '12px' }}
            />
            <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
