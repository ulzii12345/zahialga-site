import { ArrowUp, ExternalLink, Globe } from 'lucide-react';
import { useNetlify } from '../context/NetlifyContext';
import { PROFILE_DATA, PROJECTS_DATA } from '../data/portfolioData';

export function Footer() {
  const { getBaseUrl, getUrlForSlug } = useNetlify();

  return (
    <footer className="border-t border-zinc-800 bg-[#050505] text-zinc-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-zinc-800/80">
          <div>
            <div className="text-lg font-bold text-white font-display">
              {PROFILE_DATA.name}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              16 настай вэб хөгжүүлэгчийн бүтээлүүд ба хувийн портфолио сайт.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={getBaseUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline font-mono"
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span>{getBaseUrl()}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Дээш буцах"
              className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors shrink-0"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          <span className="text-zinc-500">Бүтээлүүд:</span>
          {PROJECTS_DATA.map((project) => (
            <a
              key={project.id}
              href={getUrlForSlug(project.originalSlug)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-300 hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
            >
              <span>{project.title}</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 pt-2">
          <div>© 2026 {PROFILE_DATA.name}. Бүх эрх хуулиар хамгаалагдсан.</div>
          <div className="flex items-center gap-2 text-zinc-400">
            <span>Вэб хөгжүүлэлт</span>
            <span aria-hidden="true">·</span>
            <span>16 настай</span>
            <span aria-hidden="true">·</span>
            <span>Монгол</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
