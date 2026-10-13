import React, { useEffect, useRef } from 'react';
import type { WeatherCategory } from '../types/weather';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface DynamicBackgroundProps {
  category: WeatherCategory;
  isDay: boolean;
  themeMode?: 'light' | 'dark';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  pulseSpeed?: number;
}

function getSkyGradient(category: WeatherCategory, isDay: boolean, themeMode: 'light' | 'dark'): string {
  const useLightPalette = themeMode === 'light' || (isDay && themeMode !== 'dark');

  if (category === 'clear') {
    if (useLightPalette) {
      return 'from-[#0369a1] via-[#0284c7] to-[#38bdf8]';
    }
    return 'from-[#040814] via-[#0f172a] to-[#1e1b4b]';
  }

  if (category === 'cloudy') {
    if (useLightPalette) {
      return 'from-[#1e3a5f] via-[#3b5978] to-[#64748b]';
    }
    return 'from-[#090f1d] via-[#1e293b] to-[#334155]';
  }

  if (category === 'rain') {
    return useLightPalette
      ? 'from-[#1e3a5f] via-[#2c4c6e] to-[#475569]'
      : 'from-[#050914] via-[#0f172a] to-[#1e293b]';
  }

  if (category === 'snow') {
    return useLightPalette
      ? 'from-[#1d4ed8] via-[#3b82f6] to-[#60a5fa]'
      : 'from-[#0b1528] via-[#1b2e4b] to-[#2c4870]';
  }

  if (category === 'storm') {
    return useLightPalette
      ? 'from-[#1e1b4b] via-[#312e81] to-[#475569]'
      : 'from-[#070a12] via-[#161326] to-[#29223b]';
  }

  // fog
  return useLightPalette
    ? 'from-[#334155] via-[#475569] to-[#64748b]'
    : 'from-[#111722] via-[#1f2937] to-[#374151]';
}

/**
 * Fondo atmosférico inmersivo que combina gradientes de cielo y efectos de partículas en Canvas
 * (gotas de lluvia, copos de nieve, estrellas nocturnas, bruma, nubes suaves y relámpagos).
 * Se pausa automáticamente si el usuario prefiere movimiento reducido.
 */
export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  category,
  isDay,
  themeMode = 'dark',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Inicializar partículas según la condición climática
    const particles: Particle[] = [];
    let lightningOpacity = 0;
    let lightningTimer = 0;

    if (category === 'rain' || category === 'storm') {
      const count = category === 'storm' ? 110 : 75;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: category === 'storm' ? -2.2 : -0.8,
          vy: 11 + Math.random() * 7,
          size: 14 + Math.random() * 12,
          alpha: 0.22 + Math.random() * 0.35,
        });
      }
    } else if (category === 'snow') {
      const count = 65;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.9,
          vy: 0.8 + Math.random() * 1.5,
          size: 1.8 + Math.random() * 3.2,
          alpha: 0.35 + Math.random() * 0.5,
        });
      }
    } else if (category === 'clear' && !isDay) {
      // Cielo nocturno estrellado
      const count = 85;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.78),
          vx: 0,
          vy: 0,
          size: 0.8 + Math.random() * 1.6,
          alpha: 0.25 + Math.random() * 0.65,
          pulseSpeed: 0.008 + Math.random() * 0.015,
        });
      }
    } else if (category === 'cloudy' || category === 'fog') {
      // Capas suaves de neblina o nubes derivando
      const count = 8;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.65),
          vx: 0.12 + Math.random() * 0.18,
          vy: 0,
          size: 160 + Math.random() * 200,
          alpha: category === 'fog' ? 0.065 : 0.045,
        });
      }
    }

    const drawStaticScene = () => {
      ctx.clearRect(0, 0, width, height);
      if (category === 'clear' && !isDay) {
        for (const p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.fill();
        }
      }
    };

    if (reducedMotion) {
      drawStaticScene();
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    let tick = 0;
    const render = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);

      if (category === 'rain' || category === 'storm') {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';

        for (const p of particles) {
          ctx.beginPath();
          ctx.globalAlpha = p.alpha;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 1.6, p.y + p.size);
          ctx.stroke();

          p.x += p.vx;
          p.y += p.vy;

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x < 0) {
            p.x = width;
          }
        }
        ctx.globalAlpha = 1;

        if (category === 'storm') {
          lightningTimer += 1;
          if (lightningTimer > 240 && Math.random() < 0.015) {
            lightningOpacity = 0.28;
            lightningTimer = 0;
          }
          if (lightningOpacity > 0.005) {
            ctx.fillStyle = `rgba(224, 242, 254, ${lightningOpacity})`;
            ctx.fillRect(0, 0, width, height);
            lightningOpacity *= 0.86;
          }
        }
      } else if (category === 'snow') {
        for (const p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.fill();

          p.x += p.vx + Math.sin(tick * 0.015 + p.size) * 0.25;
          p.y += p.vy;

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          if (p.x > width) p.x = 0;
          if (p.x < 0) p.x = width;
        }
      } else if (category === 'clear' && !isDay) {
        for (const p of particles) {
          const twinkle =
            p.alpha + Math.sin(tick * (p.pulseSpeed ?? 0.01) + p.x) * 0.2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(0.95, twinkle))})`;
          ctx.fill();
        }
      } else if (category === 'cloudy' || category === 'fog') {
        for (const p of particles) {
          const grad = ctx.createRadialGradient(p.x, p.y, 10, p.x, p.y, p.size);
          grad.addColorStop(0, `rgba(255, 255, 255, ${p.alpha})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.x += p.vx;
          if (p.x - p.size > width) {
            p.x = -p.size;
          }
        }
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [category, isDay, reducedMotion]);

  const gradientClass = getSkyGradient(category, isDay, themeMode);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 -z-10 bg-gradient-to-b ${gradientClass} transition-colors duration-1000 overflow-hidden`}
    >
      {/* Resplandor solar o lunar atmosférico */}
      {category === 'clear' && isDay && (
        <div
          className="pointer-events-none absolute -top-28 right-[12%] h-[420px] w-[420px] rounded-full opacity-55 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(253, 224, 71, 0.55) 0%, rgba(251, 191, 36, 0.18) 45%, rgba(56, 189, 248, 0) 75%)',
          }}
        />
      )}
      {category === 'clear' && !isDay && (
        <div
          className="pointer-events-none absolute top-12 right-[15%] h-[280px] w-[280px] rounded-full opacity-35 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(165, 180, 252, 0.4) 0%, rgba(99, 102, 241, 0.12) 55%, rgba(15, 23, 42, 0) 80%)',
          }}
        />
      )}

      {/* Horizonte luminoso sutil para dar profundidad de observatorio */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 opacity-40"
        style={{
          background:
            'linear-gradient(to top, rgba(2, 6, 23, 0.55) 0%, rgba(2, 6, 23, 0) 100%)',
        }}
      />

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </div>
  );
};
