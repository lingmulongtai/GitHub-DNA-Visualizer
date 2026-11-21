interface DNALoaderProps {
  lang?: 'ja' | 'en';
}

export function DNALoader({ lang = 'ja' }: DNALoaderProps) {
  const loadingText = lang === 'ja' ? 'プロフィールを解析中...' : 'Analyzing profile...';

  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
      <div className="h-5 w-5 rounded-full border-2 border-white/15 border-t-gh-blue animate-spin" />
      <p className="text-gh-muted font-mono text-xs">{loadingText}</p>
    </div>
  );
}
