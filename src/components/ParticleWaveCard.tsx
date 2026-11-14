import { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, RefreshCw, Sparkles } from 'lucide-react';
import { PROFILE_DATA } from '../data/portfolioData';

interface ParticleWaveCardProps {
  className?: string;
}

interface WavePoint {
  screenX: number;
  screenY: number;
  depth: number;
  radius: number;
  alpha: number;
  elevation: number;
}

export function ParticleWaveCard({ className = '' }: ParticleWaveCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const [mode, setMode] = useState<'interactive' | 'studio'>('interactive');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let animationId = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const cols = 34;
    const rows = 24;
    const spacing = 22;
    const tilt = 0.56;
    let tick = 0;

    const renderFrame = () => {
      if (!prefersReducedMotion) {
        tick += 0.03;
      }

      ctx.clearRect(0, 0, width, height);

      const centerX = width * 0.5;
      const centerY = height * 0.52;
      const cosYaw = Math.cos(0.28);
      const sinYaw = Math.sin(0.28);

      const points: WavePoint[] = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const gridX = (col - cols / 2) * spacing;
          const gridZ = (row - rows / 2) * spacing;

          const primaryWave =
            Math.sin(col * 0.25 + tick) * 14 + Math.cos(row * 0.3 + tick * 0.85) * 12;
          const secondaryWave = Math.sin((col + row) * 0.18 - tick * 1.15) * 7;

          let ripple = 0;
          if (pointerRef.current.active) {
            const dx = gridX - (pointerRef.current.x - centerX) * 0.85;
            const dz = gridZ - (pointerRef.current.y - centerY) * 0.85;
            const dist = Math.hypot(dx, dz);
            ripple = Math.exp(-dist / 75) * Math.sin(dist * 0.09 - tick * 3) * 26;
          }

          const heightY = primaryWave + secondaryWave + ripple;
          const rotatedX = gridX * cosYaw - gridZ * sinYaw;
          const rotatedZ = gridX * sinYaw + gridZ * cosYaw;

          const screenX = centerX + rotatedX;
          const screenY =
            centerY + rotatedZ * Math.cos(tilt) - heightY * Math.sin(tilt);
          const depth = rotatedZ * Math.sin(tilt) + heightY * Math.cos(tilt);

          const normalized = (heightY + 42) / 84;
          const elevation = Math.max(0.15, Math.min(1, normalized));
          const radius = Math.max(1.2, 1.5 + elevation * 2.0);
          const alpha = 0.25 + elevation * 0.72;

          points.push({
            screenX,
            screenY,
            depth,
            radius,
            alpha,
            elevation,
          });
        }
      }

      points.sort((a, b) => a.depth - b.depth);

      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        ctx.beginPath();
        ctx.arc(pt.screenX, pt.screenY, pt.radius, 0, Math.PI * 2);

        if (pt.elevation > 0.76) {
          ctx.fillStyle = `rgba(103, 232, 249, ${pt.alpha})`;
        } else if (pt.elevation > 0.45) {
          ctx.fillStyle = `rgba(226, 232, 240, ${pt.alpha * 0.85})`;
        } else {
          ctx.fillStyle = `rgba(113, 113, 122, ${pt.alpha * 0.6})`;
        }
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        animationId = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    const handleMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: true,
      };
    };

    const handleLeave = () => {
      pointerRef.current.active = false;
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseleave', handleLeave);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseleave', handleLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      className={`relative w-full h-full min-h-[320px] rounded-2xl overflow-hidden border border-zinc-800/80 bg-[#050505] shadow-2xl ${className}`}
    >
      <div className="relative w-full h-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className={`w-full h-full block cursor-crosshair transition-opacity duration-300 ${
            mode === 'interactive'
              ? 'opacity-100 z-10'
              : 'opacity-0 pointer-events-none absolute inset-0'
          }`}
        />

        <div
          className={`w-full h-full transition-opacity duration-300 ${
            mode === 'studio'
              ? 'opacity-100 z-10'
              : 'opacity-0 pointer-events-none absolute inset-0'
          }`}
        >
          <img
            src={PROFILE_DATA.heroPreviewImage}
            alt="Хөгжүүлэгчийн ажлын орчин"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40 z-10" />

        <div className="absolute top-4 right-4 z-20 flex items-center gap-1 p-1 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('interactive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              mode === 'interactive'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <RefreshCw className="w-3 h-3 text-cyan-400" />
            <span>Интерактив 3D</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              mode === 'studio'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ImageIcon className="w-3 h-3 text-cyan-400" />
            <span>Ажлын орчин</span>
          </button>
        </div>

        <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-2 text-xs text-zinc-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            {mode === 'interactive'
              ? 'Хулганаар хөдөлгөж долгионыг удирдах боломжтой'
              : 'Орчин үеийн вэб хөгжүүлэлтийн ажлын ширээ'}
          </span>
        </div>
      </div>
    </div>
  );
}
