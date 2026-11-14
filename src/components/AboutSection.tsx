import { useEffect, useState } from 'react';
import { Expand, ExternalLink, User } from 'lucide-react';
import { useNetlify } from '../context/NetlifyContext';
import { PROFILE_DATA } from '../data/portfolioData';
import type { LightboxItem } from './MediaLightbox';

interface AboutSectionProps {
  onOpenLightbox: (item: LightboxItem) => void;
}

export function AboutSection({ onOpenLightbox }: AboutSectionProps) {
  const { getUrlForSlug, getBaseUrl, isCustomized } = useNetlify();
  const customPhotoUrl = getUrlForSlug('my-photo.png');
  const [useCustomFailed, setUseCustomFailed] = useState(false);

  useEffect(() => {
    setUseCustomFailed(false);
  }, [customPhotoUrl]);

  const activePhotoSrc =
    isCustomized && !useCustomFailed
      ? customPhotoUrl
      : PROFILE_DATA.avatarImage;

  return (
    <section id="about" className="py-20 border-t border-zinc-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center gap-2 text-xs font-medium text-cyan-400 tracking-wide mb-2">
            <User className="w-4 h-4 shrink-0" />
            <span>Миний тухай</span>
            <span aria-hidden="true" className="text-zinc-600">
              ·
            </span>
            <span className="text-zinc-400">Хувийн танилцуулга</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
            Өлзийтогтохтой танилцах
          </h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
            Вэб технологи, бүтээлч сэтгэлгээ ба ирээдүйн хүсэл мөрөөдөл
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#09090b] border border-zinc-800 group flex flex-col justify-between">
              <button
                type="button"
                onClick={() =>
                  onOpenLightbox({
                    title: PROFILE_DATA.name,
                    subtitle: `${PROFILE_DATA.role} · ${PROFILE_DATA.age} настай`,
                    description: PROFILE_DATA.summary,
                    imageUrl: activePhotoSrc,
                    externalUrl: getBaseUrl(),
                    externalLabel: 'Үндсэн сайт нээх',
                  })
                }
                className="relative aspect-square w-full overflow-hidden bg-zinc-950 block text-left cursor-pointer"
                aria-label="Хөрөг зургийг томоор харах"
              >
                <img
                  src={activePhotoSrc}
                  alt={PROFILE_DATA.name}
                  referrerPolicy="no-referrer"
                  onError={() => setUseCustomFailed(true)}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                <span className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-black/75 border border-zinc-800 text-zinc-200 group-hover:text-cyan-300 flex items-center justify-center transition-colors">
                  <Expand className="w-4 h-4" />
                </span>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                  <div>
                    <div className="font-bold text-white text-lg font-display">
                      {PROFILE_DATA.name}
                    </div>
                    <div className="text-zinc-300 text-xs">
                      {PROFILE_DATA.role} · {PROFILE_DATA.age} настай
                    </div>
                  </div>
                  <span className="text-xs font-mono text-cyan-400">
                    Суралцагч
                  </span>
                </div>
              </button>

              <div className="p-4 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between gap-3 text-xs text-zinc-400">
                <span className="text-zinc-500">Үндсэн сайт:</span>
                <a
                  href={getBaseUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-mono truncate max-w-[220px]"
                >
                  <span className="truncate">{getBaseUrl().replace('https://', '')}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col">
            <div className="rounded-2xl bg-[#09090b] border border-zinc-800 p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white font-display">
                  Сайн байна уу!
                </h3>
                <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
                  Миний нэрийг Өлзийтогтох гэдэг. Би одоо 16 настай бөгөөд вэб
                  технологи, код бичих сонирхолдоо хөтлөгдөн бие даан болон
                  сургалтаар системтэйгээр суралцаж байна.
                </p>
                <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
                  Миний үндсэн зорилго бол энгийн статик хуудсуудаас эхлээд
                  орчин үеийн интерактив вэб аппликейшн, хэрэглэгчдэд таатай
                  хөдөлгөөнт интерфэйс бүтээж сурах, мөн хиймэл оюун ухааны
                  загваруудад зөв оновчтой даалгавар өгч бүтээмжээ нэмэгдүүлэх
                  явдал юм.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-zinc-800/80">
                <div className="p-4 rounded-xl bg-zinc-900/70 space-y-1">
                  <div className="text-xs text-zinc-500">Нас ба ангилал</div>
                  <div className="text-sm font-semibold text-white">
                    16 настай · Сурагч
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/70 space-y-1">
                  <div className="text-xs text-zinc-500">Үндсэн хобби</div>
                  <div className="text-sm font-semibold text-white">
                    Код бичих (HTML, CSS)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/70 space-y-1">
                  <div className="text-xs text-zinc-500">Дуртай кино</div>
                  <div className="text-sm font-semibold text-white">
                    Avengers (Өшөө авагчид)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/70 space-y-1">
                  <div className="text-xs text-zinc-500">Дуртай хоол</div>
                  <div className="text-sm font-semibold text-white">
                    Sushi (Сүши зоог)
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={getBaseUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Миний үндсэн сайт нээх</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="#goals"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Суралцах зорилго үзэх →</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
