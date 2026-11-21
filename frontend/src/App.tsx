import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { ProfileHeader } from './components/ProfileHeader';
import { LanguageDNA } from './components/LanguageDNA';
import { ActivityHeatmap } from './components/ActivityHeatmap';
import { StarDistribution } from './components/StarDistribution';
import { PersonalityRadar } from './components/PersonalityRadar';
import { Timeline } from './components/Timeline';
import { DNALoader } from './components/DNALoader';
import { ReadmeGenerator } from './components/ReadmeGenerator';
import { useGithubData } from './hooks/useGithubData';
import { useCardGenerator } from './hooks/useCardGenerator';
import { calculatePersonalityScores } from './utils/scoreCalculator';
import { Language, translations } from './i18n';
import { GitHubData } from './types';

function t(lang: Language, key: keyof typeof translations.ja): string {
  return translations[lang][key];
}

function BrandMark() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/15 bg-gh-elevated text-gh-blue">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 4c0 6 8 6 8 12" />
        <path d="M16 4c0 6-8 6-8 12" />
        <path d="M8 8h8" />
        <path d="M8 16h8" />
      </svg>
    </span>
  );
}

const SAMPLE_HANDLES = ['torvalds', 'gaearon', 'sindresorhus'];

function VisualizerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState(searchParams.get('user') ?? '');
  const [inputValue, setInputValue] = useState(searchParams.get('user') ?? '');
  const [lang, setLang] = useState<Language>('ja');
  const { data, loading, error, fetchData } = useGithubData();
  const { generateCard } = useCardGenerator();
  const hasInitialized = useRef(false);

  const handleSearch = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setUsername(trimmed);
    setInputValue(trimmed);
    setSearchParams({ user: trimmed });
    fetchData(trimmed);
  }, [fetchData, setSearchParams]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    const urlUser = searchParams.get('user');
    if (urlUser && urlUser !== username) {
      setInputValue(urlUser);
      setUsername(urlUser);
      fetchData(urlUser);
    }
  }, [fetchData, searchParams, username]);

  const scores = data ? calculatePersonalityScores(data) : null;

  return (
    <div className="min-h-screen bg-gh-bg text-gh-text flex flex-col">
      <header className="border-b border-white/[0.08] sticky top-0 z-50 bg-gh-bg/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className="font-medium text-sm tracking-[-0.01em] text-gh-text">
              GitHub DNA Visualizer
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/compare')}
              className="h-8 px-3 text-xs font-medium border border-white/[0.12] bg-gh-surface text-gh-muted rounded-md hover:border-white/25 hover:text-gh-text transition-colors"
              type="button"
            >
              {t(lang, 'compareMode')}
            </button>
            <button
              onClick={() => setLang(l => l === 'ja' ? 'en' : 'ja')}
              className="h-8 px-2.5 text-xs font-mono border border-white/[0.12] bg-gh-surface text-gh-muted rounded-md hover:border-white/25 hover:text-gh-text transition-colors"
              type="button"
            >
              {lang === 'ja' ? 'EN' : 'JA'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <section className="max-w-2xl mb-10">
          <p className="text-xs font-mono text-gh-muted mb-2">
            {lang === 'ja' ? 'GitHub プロフィール解析ワークベンチ' : 'GitHub profile analytics workbench'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-medium tracking-[-0.03em] text-gh-text mb-3">
            {t(lang, 'title')}
          </h1>
          <p className="text-gh-muted text-sm sm:text-base leading-relaxed">
            {t(lang, 'subtitle')}
          </p>
        </section>

        <section className="mb-8">
          <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-gh-subtle">
                @
              </span>
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch(inputValue)}
                placeholder={t(lang, 'placeholder')}
                className="w-full h-11 bg-gh-surface border border-white/[0.12] rounded-lg pl-8 pr-4 text-sm text-gh-text placeholder:text-gh-subtle font-mono focus:outline-none focus:border-gh-blue transition-colors"
              />
            </div>
            <button
              onClick={() => handleSearch(inputValue)}
              disabled={loading}
              className="h-11 px-5 rounded-lg text-sm font-medium bg-[#ededed] text-[#0f0f10] hover:bg-white transition-colors disabled:opacity-45"
              type="button"
            >
              {loading ? t(lang, 'searching') : t(lang, 'search')}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gh-muted">
            <span>{lang === 'ja' ? 'サンプル:' : 'Examples:'}</span>
            {SAMPLE_HANDLES.map((handle) => (
              <button
                key={handle}
                onClick={() => handleSearch(handle)}
                className="font-mono px-2 py-0.5 rounded border border-white/[0.08] bg-gh-surface text-gh-muted hover:border-white/20 hover:text-gh-text transition-colors"
                type="button"
              >
                @{handle}
              </button>
            ))}
            {data?.rateLimit.remaining !== null && data && (
              <span className="ml-auto font-mono text-gh-subtle">
                {t(lang, 'rateLimit')}: {data.rateLimit.remaining}/{data.rateLimit.limit} {t(lang, 'remaining')}
              </span>
            )}
          </div>
        </section>

        {loading && (
          <div className="flex justify-center py-16">
            <DNALoader lang={lang} />
          </div>
        )}

        {error && (
          <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-4 mb-6 flex items-center gap-3 text-sm text-rose-300">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5" />
              <path d="M12 16h.01" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {data && scores && !loading && (
          <div className="space-y-6">
            <ProfileHeader user={data.user} lang={lang} />
            <LanguageDNA languageStats={data.languageStats} lang={lang} />
            <ActivityHeatmap calendar={data.contributions.contributionCalendar} lang={lang} />
            <StarDistribution repos={data.repos} lang={lang} />
            <PersonalityRadar scores={scores} lang={lang} username={data.user.login} />
            <Timeline repos={data.repos} lang={lang} />

            <div className="flex flex-wrap items-start gap-3 pt-2">
              <button
                onClick={() => generateCard(data, scores)}
                className="inline-flex h-10 items-center gap-2 px-4 rounded-lg text-sm font-medium bg-[#ededed] text-[#0f0f10] hover:bg-white transition-colors"
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <circle cx="9" cy="10" r="1.5" />
                  <path d="m21 16-5-5-6 6" />
                </svg>
                {t(lang, 'generateCard')}
              </button>
              <ReadmeGenerator data={data} scores={scores} lang={lang} />
            </div>
          </div>
        )}

        {!data && !loading && !error && (
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/[0.08] pt-8">
            {[
              {
                title: lang === 'ja' ? '言語構成と比率' : 'Language profile',
                desc: lang === 'ja' ? '全リポジトリのバイト数から主要言語と割合を集計します。' : 'Aggregates byte share across public repositories into a clean language breakdown.',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m8 8-4 4 4 4" />
                    <path d="m16 8 4 4-4 4" />
                    <path d="m14 5-4 14" />
                  </svg>
                ),
              },
              {
                title: lang === 'ja' ? 'コントリビューション解析' : 'Contribution cadence',
                desc: lang === 'ja' ? '直近6ヶ月のヒートマップと曜日別の開発リズムを可視化します。' : 'Inspects 6-month commit cadence, weekday distribution, and developer rhythm.',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M8 2v4M16 2v4M3 10h18" />
                  </svg>
                ),
              },
              {
                title: lang === 'ja' ? '特性スコアと比較' : 'Traits & side-by-side compare',
                desc: lang === 'ja' ? '5軸レーダー、年次タイムライン、README出力および2アカウント比較に対応。' : 'Five-axis radar metrics, annual repo timeline, README export, and dual-user comparison.',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 17l6-6 4 4 8-8" />
                    <path d="M17 7h4v4" />
                  </svg>
                ),
              },
            ].map((item) => (
              <article key={item.title} className="rounded-xl border border-white/[0.08] bg-gh-surface p-5">
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] bg-gh-elevated text-gh-blue">
                  {item.icon}
                </div>
                <h2 className="text-sm font-medium text-gh-text">{item.title}</h2>
                <p className="mt-1.5 text-xs leading-relaxed text-gh-muted">{item.desc}</p>
              </article>
            ))}
          </section>
        )}
      </main>

      <footer className="border-t border-white/[0.08] py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gh-subtle">
          <span>GitHub DNA Visualizer</span>
          <span>Powered by GitHub REST & GraphQL API</span>
        </div>
      </footer>
    </div>
  );
}

function ComparePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState<Language>('ja');
  const [usernameA, setUsernameA] = useState(searchParams.get('a') ?? '');
  const [usernameB, setUsernameB] = useState(searchParams.get('b') ?? '');
  const [inputA, setInputA] = useState(searchParams.get('a') ?? '');
  const [inputB, setInputB] = useState(searchParams.get('b') ?? '');
  const dataA = useGithubData();
  const dataB = useGithubData();
  const hasInitialized = useRef(false);

  const handleCompare = useCallback(() => {
    const trimA = inputA.trim();
    const trimB = inputB.trim();
    if (!trimA || !trimB) return;
    setUsernameA(trimA);
    setUsernameB(trimB);
    dataA.fetchData(trimA);
    dataB.fetchData(trimB);
  }, [inputA, inputB, dataA, dataB]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    const a = searchParams.get('a');
    const b = searchParams.get('b');
    if (a && b) {
      setInputA(a);
      setInputB(b);
      dataA.fetchData(a);
      dataB.fetchData(b);
    }
  }, [dataA, dataB, searchParams]);

  const scoresA = dataA.data ? calculatePersonalityScores(dataA.data) : null;
  const scoresB = dataB.data ? calculatePersonalityScores(dataB.data) : null;

  return (
    <div className="min-h-screen bg-gh-bg text-gh-text">
      <header className="border-b border-white/[0.08] sticky top-0 z-50 bg-gh-bg/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.12] bg-gh-surface text-gh-muted hover:text-gh-text transition-colors"
              type="button"
              aria-label="Back"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>
            <BrandMark />
            <span className="font-medium text-sm text-gh-text">
              {lang === 'ja' ? '比較モード' : 'Compare mode'}
            </span>
          </div>
          <button
            onClick={() => setLang(l => l === 'ja' ? 'en' : 'ja')}
            className="h-8 px-2.5 text-xs font-mono border border-white/[0.12] bg-gh-surface text-gh-muted rounded-md hover:border-white/25 hover:text-gh-text transition-colors"
            type="button"
          >
            {lang === 'ja' ? 'EN' : 'JA'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-[-0.025em] text-gh-text mb-6">
          {lang === 'ja' ? '開発者 DNA 比較' : 'Developer DNA comparison'}
        </h1>

        <div className="flex flex-col sm:flex-row gap-2.5 mb-8 max-w-2xl">
          <input
            type="text"
            value={inputA}
            onChange={e => setInputA(e.target.value)}
            placeholder={lang === 'ja' ? 'ユーザー 1' : 'User 1'}
            className="flex-1 h-11 bg-gh-surface border border-white/[0.12] rounded-lg px-3.5 text-sm text-gh-text placeholder:text-gh-subtle font-mono focus:outline-none focus:border-gh-blue"
          />
          <span className="self-center font-mono text-xs text-gh-subtle px-1">vs</span>
          <input
            type="text"
            value={inputB}
            onChange={e => setInputB(e.target.value)}
            placeholder={lang === 'ja' ? 'ユーザー 2' : 'User 2'}
            className="flex-1 h-11 bg-gh-surface border border-white/[0.12] rounded-lg px-3.5 text-sm text-gh-text placeholder:text-gh-subtle font-mono focus:outline-none focus:border-gh-blue"
          />
          <button
            onClick={handleCompare}
            disabled={dataA.loading || dataB.loading}
            className="h-11 px-5 rounded-lg text-sm font-medium bg-[#ededed] text-[#0f0f10] hover:bg-white transition-colors disabled:opacity-45"
            type="button"
          >
            {lang === 'ja' ? '比較' : 'Compare'}
          </button>
        </div>

        {(dataA.loading || dataB.loading) && (
          <div className="flex justify-center py-12"><DNALoader lang={lang} /></div>
        )}

        {dataA.data && dataB.data && scoresA && scoresB && !dataA.loading && !dataB.loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CompareColumn data={dataA.data} scores={scoresA} username={usernameA} lang={lang} />
            <CompareColumn data={dataB.data} scores={scoresB} username={usernameB} lang={lang} />
          </div>
        )}
      </main>
    </div>
  );
}

interface CompareColumnProps {
  data: GitHubData;
  scores: ReturnType<typeof calculatePersonalityScores>;
  username: string;
  lang: Language;
}

function CompareColumn({ data, scores, username, lang }: CompareColumnProps) {
  return (
    <div className="space-y-4">
      <ProfileHeader user={data.user} lang={lang} />
      <LanguageDNA languageStats={data.languageStats} lang={lang} />
      <PersonalityRadar scores={scores} lang={lang} username={username} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VisualizerPage />} />
        <Route path="/compare" element={<ComparePage />} />
      </Routes>
    </BrowserRouter>
  );
}
