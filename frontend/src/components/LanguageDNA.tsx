import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getLanguageColor } from '../utils/githubColors';
import { TranslationKey, translations } from '../i18n';

interface LanguageDNAProps {
  languageStats: Record<string, number>;
  lang: 'ja' | 'en';
}

function t(lang: 'ja' | 'en', key: TranslationKey): string {
  return translations[lang][key];
}

export function LanguageDNA({ languageStats, lang }: LanguageDNAProps) {
  const totalBytes = Object.values(languageStats).reduce((a, b) => a + b, 0);

  const data = Object.entries(languageStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, bytes]) => ({
      name,
      value: bytes,
      percentage: Math.round((bytes / Math.max(totalBytes, 1)) * 100),
      color: getLanguageColor(name),
    }));

  const top5 = data.slice(0, 5);

  return (
    <section className="bg-gh-surface border border-white/[0.08] rounded-xl p-6">
      <div className="mb-5">
        <h3 className="text-base font-medium text-gh-text">{t(lang, 'languageSection')}</h3>
        <p className="text-gh-muted text-xs mt-1">{t(lang, 'languageDNA')}</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-full md:w-64 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={94}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#19191b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value: number, name: string) => [
                  `${Math.round((value / Math.max(totalBytes, 1)) * 100)}%`,
                  name,
                ]}
              />
              <Legend
                formatter={(value) => <span style={{ color: '#9898a0', fontSize: '12px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 w-full space-y-3">
          {top5.map((langItem, i) => (
            <div key={langItem.name} className="flex items-center gap-3">
              <span className="text-gh-subtle font-mono text-xs w-4">{i + 1}</span>
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: langItem.color }} />
              <span className="text-gh-text text-sm flex-1">{langItem.name}</span>
              <div className="flex-1 bg-gh-elevated rounded-full h-1.5 max-w-36 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${langItem.percentage}%`, background: langItem.color }} />
              </div>
              <span className="text-gh-muted font-mono text-xs w-10 text-right">{langItem.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
