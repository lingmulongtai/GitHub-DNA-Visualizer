import { GitHubUser } from '../types';
import { TranslationKey, translations } from '../i18n';

interface ProfileHeaderProps {
  user: GitHubUser;
  lang: 'ja' | 'en';
}

function t(lang: 'ja' | 'en', key: TranslationKey): string {
  return translations[lang][key];
}

export function ProfileHeader({ user, lang }: ProfileHeaderProps) {
  const createdAt = new Date(user.created_at);
  const yearsActive = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365));

  return (
    <section className="bg-gh-surface border border-white/[0.08] rounded-xl p-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={user.avatar_url}
          alt={user.login}
          className="w-20 h-20 rounded-xl border border-white/[0.12] object-cover"
        />
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="flex flex-wrap items-baseline justify-center sm:justify-start gap-x-2.5 gap-y-1">
            <h2 className="text-xl font-medium text-gh-text">{user.name ?? user.login}</h2>
            <span className="text-gh-muted font-mono text-sm">@{user.login}</span>
          </div>
          {user.bio && <p className="mt-2 text-sm text-gh-muted leading-relaxed">{user.bio}</p>}

          <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-gh-muted">
            {user.location && <span>{user.location}</span>}
            {user.company && <span>{user.company}</span>}
            {user.blog && (
              <a href={user.blog} target="_blank" rel="noopener noreferrer" className="text-gh-blue hover:underline">
                {user.blog}
              </a>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/[0.08] pt-4">
            {[
              { label: t(lang, 'followers'), value: user.followers.toLocaleString() },
              { label: t(lang, 'following'), value: user.following.toLocaleString() },
              { label: t(lang, 'repos'), value: user.public_repos.toLocaleString() },
              { label: t(lang, 'yearsActive'), value: String(yearsActive) },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-lg font-medium font-mono text-gh-text">{stat.value}</div>
                <div className="text-xs text-gh-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
