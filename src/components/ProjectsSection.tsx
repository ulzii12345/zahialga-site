import { useState } from 'react';
import {
  ArrowUpRight,
  Briefcase,
  Expand,
  Layers,
  Settings2,
  Sparkles,
  Youtube,
} from 'lucide-react';
import { useNetlify } from '../context/NetlifyContext';
import { PROJECTS_DATA, type ProjectItem } from '../data/portfolioData';
import type { LightboxItem } from './MediaLightbox';

interface ProjectsSectionProps {
  onOpenLightbox: (item: LightboxItem) => void;
}

export function ProjectsSection({ onOpenLightbox }: ProjectsSectionProps) {
  const { getUrlForSlug, setIsConfigOpen, subdomain } = useNetlify();
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const renderProjectIcon = (icon: ProjectItem['icon']) => {
    if (icon === 'youtube') {
      return <Youtube className="w-5 h-5 text-rose-400" />;
    }
    return <Briefcase className="w-5 h-5 text-cyan-400" />;
  };

  return (
    <section
      id="projects"
      className="py-20 border-t border-zinc-800/80 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-cyan-400 tracking-wide mb-2">
              <Layers className="w-4 h-4 shrink-0" />
              <span>Төслүүдийн жагсаалт</span>
              <span aria-hidden="true" className="text-zinc-600">
                ·
              </span>
              <span className="text-zinc-400 tabular-nums">
                Нийт {PROJECTS_DATA.length} бүтээл
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
              Миний бүтээлүүд
            </h2>
            <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
              Бие даан болон сургалтын хүрээнд хийсэн вэб төслүүд. Зураг дээр
              дарж томоор харах эсвэл холбоосоор шинэ цонхонд нээнэ үү.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsConfigOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors whitespace-nowrap shrink-0 self-start md:self-auto"
          >
            <Settings2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Netlify хаяг:</span>
            <span className="font-mono text-cyan-300 truncate max-w-[140px]">
              {subdomain}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {PROJECTS_DATA.map((project, index) => {
            const targetUrl = getUrlForSlug(project.originalSlug);
            const paddedIndex = String(index + 1).padStart(2, '0');
            const imageFailed = failedImages[project.id];

            return (
              <article
                key={project.id}
                className="group flex flex-col justify-between rounded-2xl bg-[#09090b] border border-zinc-800 hover:border-zinc-700 transition-colors duration-200 overflow-hidden"
              >
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenLightbox({
                        title: `${paddedIndex}. ${project.title}`,
                        subtitle: `${project.category} · ${project.originalSlug}`,
                        description: project.description,
                        imageUrl: project.previewImage,
                        externalUrl: targetUrl,
                        externalLabel: 'Шинэ цонхонд нээх',
                      })
                    }
                    className="relative block aspect-[16/9] w-full overflow-hidden bg-zinc-950 border-b border-zinc-800/80 text-left cursor-pointer"
                    aria-label={`${project.title} зургийг томоор харах`}
                  >
                    {!imageFailed ? (
                      <img
                        src={project.previewImage}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({
                            ...prev,
                            [project.id]: true,
                          }))
                        }
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mb-3">
                          {renderProjectIcon(project.icon)}
                        </div>
                        <span className="text-base font-bold text-white">
                          {project.title}
                        </span>
                        <span className="text-xs text-zinc-500 font-mono mt-1">
                          {project.originalSlug}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/90 via-transparent to-black/20 pointer-events-none" />

                    <span className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-black/75 border border-zinc-800 text-zinc-200 group-hover:text-cyan-300 flex items-center justify-center transition-colors">
                      <Expand className="w-4 h-4" />
                    </span>

                    <div className="absolute bottom-3 left-4 flex items-center gap-2 text-xs text-zinc-200">
                      {renderProjectIcon(project.icon)}
                      <span className="font-medium">{project.category}</span>
                    </div>
                  </button>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                      <span className="tabular-nums text-cyan-400">
                        {paddedIndex}
                      </span>
                      <span aria-hidden="true" className="text-zinc-600">
                        /
                      </span>
                      <span>{project.originalSlug}</span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white font-display group-hover:text-cyan-300 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm text-zinc-400 leading-relaxed mt-2">
                        {project.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-800/70 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-zinc-400">
                      {project.highlights.map((highlight, idx) => (
                        <span key={highlight} className="inline-flex items-center gap-2.5">
                          {idx > 0 && (
                            <span aria-hidden="true" className="text-zinc-600">
                              ·
                            </span>
                          )}
                          <span>{highlight}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-zinc-800/80 flex items-center justify-between gap-4 bg-zinc-950/50">
                  <div className="min-w-0">
                    <div className="text-xs text-zinc-500">Очих хаяг:</div>
                    <div className="font-mono text-xs text-zinc-300 truncate max-w-[200px] sm:max-w-xs">
                      {targetUrl}
                    </div>
                  </div>

                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Шинэ цонхонд нээх</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Бүх төслүүд нэг жагсаалт (array) бүтцээр кодлогдсон бөгөөд карт
              бүрийн холбоос шинэ табд нээгдэнэ.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsConfigOpen(true)}
            className="text-cyan-400 hover:underline font-medium whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            Netlify домэйн өөрчлөх →
          </button>
        </div>
      </div>
    </section>
  );
}
