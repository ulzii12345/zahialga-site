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

interface RipplePulse {
  gx: number;
  gz: number;
  startTime: number;
}

export function ParticleWaveCard({ className = '' }: ParticleWaveCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef({
    x: 0,
    y: 0,
    nx: 0,
    ny: 0,
    active: false,
    dragging: false,
    lastDragX: 0,
    lastDragY: 0,
  });
  const orbitRef = useRef({
    yawOffset: 0,
    pitchOffset: 0,
    targetYawOffset: 0,
    targetPitchOffset: 0,
  });
  const pulsesRef = useRef<RipplePulse[]>([]);
  const [mode, setMode] = useState<'interactive' | 'studio'>('interactive');

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    motionQuery.addEventListener('change', handleMotionChange);

    let animationId = 0;
    let width = 0;
    let height = 0;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const nextWidth = Math.max(container.clientWidth, Math.floor(rect.width));
      const nextHeight = Math.max(container.clientHeight, Math.floor(rect.height));
      if (nextWidth <= 0 || nextHeight <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);
    window.addEventListener('resize', updateSize);

    const cols = 32;
    const rows = 22;
    const baseYaw = 0.36;
    const basePitch = 0.56;
    let tick = 0;

    const gridPoints: WavePoint[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        screenX: 0,
        screenY: 0,
        depth: 0,
        radius: 1.5,
        alpha: 0.5,
        elevation: 0.5,
      }))
    );
    const sortedPoints: WavePoint[] = [];

    const renderFrame = (now: number) => {
      if (width <= 0 || height <= 0) {
        updateSize();
      }

      if (width > 0 && height > 0) {
        tick += prefersReducedMotion ? 0.009 : 0.026;

        // Smooth camera orbit follow
        const hoverYaw = pointerRef.current.active && !pointerRef.current.dragging
          ? pointerRef.current.nx * 0.24
          : 0;
        const hoverPitch = pointerRef.current.active && !pointerRef.current.dragging
          ? pointerRef.current.ny * 0.14
          : 0;

        orbitRef.current.yawOffset +=
          (orbitRef.current.targetYawOffset + hoverYaw - orbitRef.current.yawOffset) * 0.08;
        orbitRef.current.pitchOffset +=
          (orbitRef.current.targetPitchOffset + hoverPitch - orbitRef.current.pitchOffset) * 0.08;

        const yaw = baseYaw + orbitRef.current.yawOffset;
        const pitch = Math.max(
          0.22,
          Math.min(1.15, basePitch + orbitRef.current.pitchOffset)
        );

        const cosYaw = Math.cos(yaw);
        const sinYaw = Math.sin(yaw);
        const cosPitch = Math.cos(pitch);
        const sinPitch = Math.sin(pitch);

        const minDim = Math.min(width, height);
        const spacing = Math.max(11, Math.min(23, minDim / 18));
        const focalLength = Math.max(360, minDim * 1.45);
        const cameraDist = Math.max(420, minDim * 1.55);
        const centerX = width * 0.5;
        const centerY = height * 0.53;

        // Clear & subtle atmospheric glow
        ctx.clearRect(0, 0, width, height);
        const bgGlow = ctx.createRadialGradient(
          centerX,
          centerY,
          minDim * 0.05,
          centerX,
          centerY,
          Math.max(width, height) * 0.65
        );
        bgGlow.addColorStop(0, 'rgba(212, 212, 216, 0.10)');
        bgGlow.addColorStop(0.55, 'rgba(113, 113, 122, 0.03)');
        bgGlow.addColorStop(1, 'rgba(5, 5, 5, 0)');
        ctx.fillStyle = bgGlow;
        ctx.fillRect(0, 0, width, height);

        // Inverse-project pointer onto y = 0 wave plane for accurate 3D ripple
        let cursorGx = 0;
        let cursorGz = 0;
        let hasCursorOnPlane = false;

        if (pointerRef.current.active) {
          const dx = pointerRef.current.x - centerX;
          const dy = pointerRef.current.y - centerY;
          const denom = sinPitch * focalLength + dy * cosPitch;
          if (Math.abs(denom) > 24) {
            const rz = Math.max(-500, Math.min(500, (-dy * cameraDist) / denom));
            const persp = focalLength / Math.max(120, cameraDist + rz * cosPitch);
            const rx = dx / persp;
            cursorGx = rx * cosYaw + rz * sinYaw;
            cursorGz = -rx * sinYaw + rz * cosYaw;
            hasCursorOnPlane = true;
          }
        }

        // Prune expired click pulses (> 2.4s)
        pulsesRef.current = pulsesRef.current.filter((p) => now - p.startTime < 2400);

        sortedPoints.length = 0;

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const gridX = (col - (cols - 1) / 2) * spacing;
            const gridZ = (row - (rows - 1) / 2) * spacing;

            const primaryWave =
              Math.sin(col * 0.27 + tick) * 14 +
              Math.cos(row * 0.32 + tick * 0.85) * 12;
            const secondaryWave =
              Math.sin((col + row) * 0.19 - tick * 1.15) * 7;

            let ripple = 0;
            if (hasCursorOnPlane) {
              const dist = Math.hypot(gridX - cursorGx, gridZ - cursorGz);
              ripple +=
                Math.exp(-dist / (spacing * 3.8)) *
                Math.sin(dist * 0.095 - tick * 3.2) *
                28;
            }

            for (let p = 0; p < pulsesRef.current.length; p++) {
              const pulse = pulsesRef.current[p];
              const ageSec = (now - pulse.startTime) / 1000;
              const ringRadius = ageSec * spacing * 11;
              const dist = Math.hypot(gridX - pulse.gx, gridZ - pulse.gz);
              const band = Math.abs(dist - ringRadius);
              const envelope = Math.exp(-band / (spacing * 1.6)) * Math.max(0, 1 - ageSec / 2.4);
              ripple += Math.cos(band * 0.14) * envelope * 34;
            }

            const heightY = primaryWave + secondaryWave + ripple;

            // Rotate around Y (yaw)
            const rx = gridX * cosYaw - gridZ * sinYaw;
            const rz = gridX * sinYaw + gridZ * cosYaw;

            // Rotate around X (pitch)
            const vy = -heightY * cosPitch - rz * sinPitch;
            const vz = rz * cosPitch - heightY * sinPitch;

            // Perspective projection
            const perspective = focalLength / Math.max(120, cameraDist + vz);
            const screenX = centerX + rx * perspective;
            const screenY = centerY + vy * perspective;

            const normalized = (heightY + 42) / 84;
            const elevation = Math.max(0.12, Math.min(1, normalized));
            const depthFactor = Math.max(0.55, Math.min(1.45, perspective));
            const radius = Math.max(1.1, (1.35 + elevation * 2.15) * depthFactor);
            const alpha = Math.min(1, (0.24 + elevation * 0.72) * (0.65 + depthFactor * 0.35));

            const pt = gridPoints[row][col];
            pt.screenX = screenX;
            pt.screenY = screenY;
            pt.depth = vz;
            pt.radius = radius;
            pt.alpha = alpha;
            pt.elevation = elevation;

            sortedPoints.push(pt);
          }
        }

        // Subtle 3D wireframe lattice lines for clear 3D spatial depth
        ctx.lineWidth = 0.75;
        for (let row = 0; row < rows; row++) {
          ctx.beginPath();
          for (let col = 0; col < cols; col++) {
            const pt = gridPoints[row][col];
            if (col === 0) {
              ctx.moveTo(pt.screenX, pt.screenY);
            } else {
              ctx.lineTo(pt.screenX, pt.screenY);
            }
          }
          ctx.strokeStyle = 'rgba(212, 212, 216, 0.10)';
          ctx.stroke();
        }

        for (let col = 0; col < cols; col += 2) {
          ctx.beginPath();
          for (let row = 0; row < rows; row++) {
            const pt = gridPoints[row][col];
            if (row === 0) {
              ctx.moveTo(pt.screenX, pt.screenY);
            } else {
              ctx.lineTo(pt.screenX, pt.screenY);
            }
          }
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
          ctx.stroke();
        }

        // Depth-sort particles far -> near
        sortedPoints.sort((a, b) => b.depth - a.depth);

        for (let i = 0; i < sortedPoints.length; i++) {
          const pt = sortedPoints[i];
          ctx.beginPath();
          ctx.arc(pt.screenX, pt.screenY, pt.radius, 0, Math.PI * 2);

          if (pt.elevation > 0.72) {
            ctx.fillStyle = `rgba(244, 244, 245, ${pt.alpha})`;
          } else if (pt.elevation > 0.44) {
            ctx.fillStyle = `rgba(180, 180, 190, ${pt.alpha * 0.85})`;
          } else {
            ctx.fillStyle = `rgba(92, 92, 102, ${pt.alpha * 0.65})`;
          }
          ctx.fill();
        }

        // Subtle cursor glow indicator on active hover
        if (pointerRef.current.active) {
          const cursorGlow = ctx.createRadialGradient(
            pointerRef.current.x,
            pointerRef.current.y,
            0,
            pointerRef.current.x,
            pointerRef.current.y,
            56
          );
          cursorGlow.addColorStop(0, 'rgba(228, 228, 231, 0.20)');
          cursorGlow.addColorStop(1, 'rgba(228, 228, 231, 0)');
          ctx.fillStyle = cursorGlow;
          ctx.beginPath();
          ctx.arc(pointerRef.current.x, pointerRef.current.y, 56, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(renderFrame);
    };

    animationId = requestAnimationFrame(renderFrame);

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      pointerRef.current.x = x;
      pointerRef.current.y = y;
      pointerRef.current.nx = ((x / rect.width) - 0.5) * 2;
      pointerRef.current.ny = ((y / rect.height) - 0.5) * 2;
      pointerRef.current.active = true;
    };

    const spawnPulseAtPointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const minDim = Math.min(rect.width, rect.height);
      const focalLength = Math.max(360, minDim * 1.45);
      const cameraDist = Math.max(420, minDim * 1.55);
      const centerX = rect.width * 0.5;
      const centerY = rect.height * 0.53;

      const yaw = baseYaw + orbitRef.current.yawOffset;
      const pitch = Math.max(0.22, Math.min(1.15, basePitch + orbitRef.current.pitchOffset));
      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);
      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);

      const dx = x - centerX;
      const dy = y - centerY;
      const denom = sinPitch * focalLength + dy * cosPitch;
      if (Math.abs(denom) > 24) {
        const rz = Math.max(-500, Math.min(500, (-dy * cameraDist) / denom));
        const persp = focalLength / Math.max(120, cameraDist + rz * cosPitch);
        const rx = dx / persp;
        const gx = rx * cosYaw + rz * sinYaw;
        const gz = -rx * sinYaw + rz * cosYaw;
        pulsesRef.current.push({
          gx,
          gz,
          startTime: performance.now(),
        });
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      updatePointer(event.clientX, event.clientY);
      pointerRef.current.dragging = true;
      pointerRef.current.lastDragX = event.clientX;
      pointerRef.current.lastDragY = event.clientY;
      spawnPulseAtPointer(event.clientX, event.clientY);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (pointerRef.current.dragging) {
        const deltaX = event.clientX - pointerRef.current.lastDragX;
        const deltaY = event.clientY - pointerRef.current.lastDragY;
        pointerRef.current.lastDragX = event.clientX;
        pointerRef.current.lastDragY = event.clientY;

        orbitRef.current.targetYawOffset += deltaX * 0.006;
        orbitRef.current.targetPitchOffset = Math.max(
          -0.34,
          Math.min(0.55, orbitRef.current.targetPitchOffset + deltaY * 0.005)
        );
      }
      updatePointer(event.clientX, event.clientY);
    };

    const handlePointerUp = () => {
      pointerRef.current.dragging = false;
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
      pointerRef.current.dragging = false;
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleResetView = () => {
    orbitRef.current.targetYawOffset = 0;
    orbitRef.current.targetPitchOffset = 0;
    pulsesRef.current.push({
      gx: 0,
      gz: 0,
      startTime: performance.now(),
    });
  };

  return (
    <div
      className={`relative w-full h-full min-h-[340px] sm:min-h-[380px] lg:min-h-[420px] rounded-2xl overflow-hidden border border-zinc-800/80 bg-[#050505] shadow-2xl ${className}`}
    >
      <div
        ref={containerRef}
        className="relative w-full h-full min-h-[340px] sm:min-h-[380px] lg:min-h-[420px] overflow-hidden select-none"
      >
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full block touch-pan-y cursor-grab active:cursor-grabbing transition-opacity duration-300 ${
            mode === 'interactive'
              ? 'opacity-100 z-10'
              : 'opacity-0 pointer-events-none z-0'
          }`}
        />

        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
            mode === 'studio'
              ? 'opacity-100 z-10'
              : 'opacity-0 pointer-events-none z-0'
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
            onClick={() => {
              setMode('interactive');
              if (mode === 'interactive') {
                handleResetView();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              mode === 'interactive'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <RefreshCw className="w-3 h-3 text-zinc-300" />
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
            <ImageIcon className="w-3 h-3 text-zinc-300" />
            <span>Ажлын орчин</span>
          </button>
        </div>

        <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-2 text-xs text-zinc-300">
          <Sparkles className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
          <span>
            {mode === 'interactive'
              ? 'Хулганаар чирэх эсвэл дарж 3D долгионыг удирдах боломжтой'
              : 'Орчин үеийн вэб хөгжүүлэлтийн ажлын ширээ'}
          </span>
        </div>
      </div>
    </div>
  );
}
