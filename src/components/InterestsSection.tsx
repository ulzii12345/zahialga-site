import { useState } from 'react';
import {
  Check,
  CodeXml,
  Copy,
  Expand,
  Film,
  Heart,
  Terminal,
  Utensils,
} from 'lucide-react';
import { INTERESTS_DATA } from '../data/portfolioData';
import type { LightboxItem } from './MediaLightbox';

interface InterestsSectionProps {
  onOpenLightbox: (item: LightboxItem) => void;
}

const PROFILE_JSON_SNIPPET = `{
  "name": "Өлзийтогтох",
  "age": 16,
  "hobbies": ["Код бичих", "Шинэ вэб бүтээх"],
  "favoriteMovie": "Avengers",
  "favoriteFood": "Sushi",
  "motto": "Өдөр бүр шинийг сурч, бүтээлчээр хөгжих"
}`;

export function InterestsSection({ onOpenLightbox }: InterestsSectionProps) {
  const [copied, setCopied] = useState(false);

  const renderInterestIcon = (id: string) => {
    switch (id) {
      case 'hobby-code':
        return <CodeXml className="w-4 h-4 text-cyan-400 shrink-0" />;
      case 'movie-avengers':
        return <Film className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'food-sushi':
        return <Utensils className="w-4 h-4 text-emerald-400 shrink-0" />;
      default:
        return <Heart className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE_JSON_SNIPPET);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failures in restricted environments
    }
  };

  return (
    <section
      id="interests"
      className="py-20 border-t border-zinc-800/80 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center gap-2 text-xs font-medium text-cyan-400 tracking-wide mb-2">
            <Heart className="w-4 h-4 shrink-0" />
            <span>Сонирхол ба хобби</span>
            <span aria-hidden="true" className="text-zinc-600">
              ·
            </span>
            <span className="text-zinc-400">Чөлөөт цаг ба таашаал</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
            Миний сонирхдог зүйлс
          </h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
            Код бичих дур сонирхлоос эхлээд дуртай кино, амтат зоог хүртэлх
            миний ертөнц
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {INTERESTS_DATA.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col justify-between rounded-2xl bg-[#09090b] border border-zinc-800 hover:border-zinc-700 transition-colors duration-200 overflow-hidden"
            >
              <div>
                <button
                  type="button"
                  onClick={() =>
                    onOpenLightbox({
                      title: item.title,
                      subtitle: item.type,
                      description: item.description,
                      imageUrl: item.imageUrl,
                    })
                  }
                  className="relative block aspect-[4/3] w-full overflow-hidden bg-zinc-950 border-b border-zinc-800/80 text-left cursor-pointer"
                  aria-label={`${item.title} зургийг томоор харах`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/90 via-transparent to-black/20 pointer-events-none" />

                  <span className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-black/75 border border-zinc-800 text-zinc-200 group-hover:text-cyan-300 flex items-center justify-center transition-colors">
                    <Expand className="w-4 h-4" />
                  </span>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-xs text-zinc-200">
                    {renderInterestIcon(item.id)}
                    <span className="truncate font-medium">{item.type}</span>
                  </div>
                </button>

                <div className="p-6 space-y-2.5">
                  <h3 className="text-xl font-bold text-white font-display group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="px-6 py-3.5 border-t border-zinc-800/80 text-xs text-zinc-400">
                {item.meta}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-[#09090b] border border-zinc-800/90 p-5 sm:p-6 font-mono text-xs text-zinc-300 space-y-3 overflow-x-auto">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-zinc-800 text-zinc-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>profile_interests.json</span>
              <span aria-hidden="true" className="text-zinc-600">
                ·
              </span>
              <span className="text-zinc-500">UTF-8</span>
            </div>

            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-sans font-medium text-zinc-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Хуулагдлаа</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>JSON хуулах</span>
                </>
              )}
            </button>
          </div>

          <pre className="text-zinc-400 leading-relaxed pt-1 overflow-x-auto">
            {PROFILE_JSON_SNIPPET}
          </pre>
        </div>
      </div>
    </section>
  );
}
