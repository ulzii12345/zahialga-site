import { ArrowDown, CodeXml, ExternalLink } from 'lucide-react';
import { useNetlify } from '../context/NetlifyContext';
import { PROFILE_DATA, PROJECTS_DATA } from '../data/portfolioData';
import { ParticleWaveCard } from './ParticleWaveCard';

export function HeroSection() {
  const { getBaseUrl } = useNetlify();

  return (
    <section
      id="hero"
      className="relative pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div className="flex items-center gap-2 text-xs font-medium text-cyan-400 tracking-wide">
              <CodeXml className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Сурагч хөгжүүлэгчийн портфолио</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight text-white leading-[1.12] text-balance font-display">
              Сайн байна уу, намайг{' '}
              <span className="text-cyan-400">{PROFILE_DATA.name}</span> гэдэг.
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl">
              Би 16 настай, орчин үеийн вэб технологиуд болон хэрэглэгчийн
              интерактив интерфэйс бүтээж сурч байна. Өөрийн бүтээсэн вэб
              сайтууд болон сонирхолтой төслүүдээ энд нэгтгэн танилцуулж байна.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#order"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors whitespace-nowrap shrink-0 group"
              >
                <span>Вэб сайт захиалах</span>
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </a>

              <a
                href="#projects"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                <span>Миний бүтээлүүд</span>
              </a>

              <a
                href={getBaseUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Үндсэн Netlify сайт</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 pt-1">
              <span>Интерактив 3D долгион загвар</span>
              <span aria-hidden="true" className="text-zinc-600">
                ·
              </span>
              <span>Бүрэн монгол тайлбартай</span>
            </div>
          </div>

          <div className="lg:col-span-6 flex min-h-[340px]">
            <ParticleWaveCard className="w-full" />
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-zinc-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight tabular-nums">
              {PROFILE_DATA.age}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Насны ангилал · Сурагч
            </div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-cyan-400 tracking-tight tabular-nums">
              {PROJECTS_DATA.length} Төсөл
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Бүтээлүүд нэг жагсаалтад
            </div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
              Код бичих
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Үндсэн хобби ба сонирхол
            </div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-cyan-300 tracking-tight">
              AI + Вэб
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Сургалтын гол зорилго
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
