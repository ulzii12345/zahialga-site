import React, { useEffect, useState } from 'react';
import { Check, ExternalLink, Globe, RotateCcw, X } from 'lucide-react';
import { useNetlify } from '../context/NetlifyContext';

export function NetlifyConfigModal() {
  const {
    subdomain,
    setSubdomain,
    resetSubdomain,
    getBaseUrl,
    isConfigOpen,
    setIsConfigOpen,
    isCustomized,
  } = useNetlify();

  const [draft, setDraft] = useState(subdomain);

  useEffect(() => {
    setDraft(subdomain);
  }, [subdomain, isConfigOpen]);

  useEffect(() => {
    if (!isConfigOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsConfigOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConfigOpen, setIsConfigOpen]);

  if (!isConfigOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubdomain(draft);
    setIsConfigOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Netlify Холбоос Тохиргоо"
      onClick={() => setIsConfigOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-lg bg-[#09090b] border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white font-display">
                Netlify Холбоос Тохиргоо
              </h3>
              <p className="text-xs text-zinc-400">
                Өөрийн Netlify сайтын нэрийг солих
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsConfigOpen(false)}
            aria-label="Хаах"
            className="w-9 h-9 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <p className="text-xs leading-relaxed text-zinc-400">
            Одоо холбогдсон үндсэн Netlify хаяг нь{' '}
            <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded">
              https://thunderous-valkyrie-0d52fb.netlify.app
            </code>{' '}
            юм. Хэрэв та өөр Netlify сайтын хаяг руу солихыг хүсвэл энд бичиж
            хадгална уу.
          </p>

          <div>
            <label
              htmlFor="netlify-subdomain-input"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              Netlify домэйн нэр
            </label>
            <div className="flex items-center rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 focus-within:border-zinc-400 transition-colors">
              <span className="text-xs text-zinc-500 select-none mr-1">
                https://
              </span>
              <input
                id="netlify-subdomain-input"
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="thunderous-valkyrie-0d52fb"
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-zinc-600 font-mono"
              />
              <span className="text-xs text-zinc-500 select-none ml-1">
                .netlify.app
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-2 text-xs">
            <div className="text-zinc-400 flex items-center justify-between gap-2">
              <span>Одоогийн үндсэн сайт:</span>
              <a
                href={getBaseUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-200 hover:text-white hover:underline inline-flex items-center gap-1 font-mono truncate max-w-[220px]"
              >
                <span className="truncate">{getBaseUrl()}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
            <div className="text-zinc-500 pt-2 border-t border-zinc-800/60">
              Бүх бүтээлийн картын холбоос энэ хаягийн дагуу шинэ цонхонд
              автоматаар нээгдэнэ.
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={() => {
                resetSubdomain();
                setDraft('thunderous-valkyrie-0d52fb');
              }}
              disabled={!isCustomized && draft === 'thunderous-valkyrie-0d52fb'}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Анхны хаягт оруулах</span>
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setIsConfigOpen(false)}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-lg transition-colors"
              >
                Болих
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-zinc-200 hover:bg-white rounded-lg transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Хадгалах</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
