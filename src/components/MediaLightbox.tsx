import { useEffect } from 'react';
import { ExternalLink, X } from 'lucide-react';

export interface LightboxItem {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  externalUrl?: string;
  externalLabel?: string;
}

interface MediaLightboxProps {
  item: LightboxItem | null;
  onClose: () => void;
}

export function MediaLightbox({ item, onClose }: MediaLightboxProps) {
  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-4xl rounded-2xl bg-[#09090b] border border-zinc-800 overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-zinc-800/80">
          <div className="min-w-0">
            <div className="text-xs text-zinc-400 truncate">{item.subtitle}</div>
            <h3 className="text-lg font-bold text-white font-display truncate">
              {item.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Хаах"
            className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative aspect-[16/9] w-full bg-zinc-950 overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-zinc-800/80">
          <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
            {item.description}
          </p>
          {item.externalUrl && (
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-black bg-zinc-200 hover:bg-white rounded-xl transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
            >
              <span>{item.externalLabel || 'Шинэ цонхонд нээх'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
