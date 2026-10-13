import React from 'react';
import { motion } from 'framer-motion';
import type { WeatherCategory } from '../types/weather';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface AnimatedWeatherIconProps {
  category: WeatherCategory;
  isDay?: boolean;
  size?: number;
  className?: string;
}

/**
 * Iconografía meteorológica vectorial animada con Framer Motion.
 * Respeta prefers-reduced-motion deteniendo las animaciones cíclicas.
 */
export const AnimatedWeatherIcon: React.FC<AnimatedWeatherIconProps> = ({
  category,
  isDay = true,
  size = 64,
  className = '',
}) => {
  const reducedMotion = useReducedMotion();

  if (category === 'clear' && isDay) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <motion.g
          animate={reducedMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '32px', originY: '32px' }}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1="32"
              y1="6"
              x2="32"
              y2="12"
              stroke="#FDE047"
              strokeWidth="3.2"
              strokeLinecap="round"
              transform={`rotate(${angle} 32 32)`}
            />
          ))}
        </motion.g>
        <circle
          cx="32"
          cy="32"
          r="14"
          fill="url(#sunGrad)"
          stroke="#FEF08A"
          strokeWidth="1.5"
        />
        <defs>
          <linearGradient id="sunGrad" x1="18" y1="18" x2="46" y2="46" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEF08A" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (category === 'clear' && !isDay) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <motion.path
          animate={reducedMotion ? undefined : { rotate: [-4, 4, -4] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '32px', originY: '32px' }}
          d="M41.5 41.2C32.8 41.2 25.8 34.2 25.8 25.5C25.8 20.6 28 16.2 31.5 13.3C22.2 14.2 15 22 15 31.6C15 41.8 23.2 50 33.4 50C40.6 50 46.9 45.8 49.9 39.8C47.3 40.7 44.5 41.2 41.5 41.2Z"
          fill="url(#moonGrad)"
          stroke="#E0E7FF"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <motion.circle
          animate={reducedMotion ? undefined : { opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          cx="46"
          cy="19"
          r="1.8"
          fill="#FEF9C3"
        />
        <motion.circle
          animate={reducedMotion ? undefined : { opacity: [0.9, 0.3, 0.9] }}
          transition={{ duration: 4, repeat: Infinity }}
          cx="52"
          cy="28"
          r="1.3"
          fill="#E0E7FF"
        />
        <defs>
          <linearGradient id="moonGrad" x1="15" y1="13" x2="50" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E0E7FF" />
            <stop offset="1" stopColor="#818CF8" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (category === 'cloudy') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        {isDay && (
          <circle cx="23" cy="24" r="9" fill="#FBBF24" opacity="0.85" />
        )}
        <motion.path
          animate={reducedMotion ? undefined : { x: [-2, 2, -2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          d="M22 46H45C50.5 46 55 41.5 55 36C55 30.8 51.1 26.6 46 26.1C44.2 19.2 38 14 30.5 14C21.9 14 15 20.9 15 29.5C15 30.2 15.1 30.9 15.2 31.6C11.6 32.8 9 36.1 9 40C9 45 13 46 18 46H22Z"
          fill="url(#cloudGrad)"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.5"
        />
        <defs>
          <linearGradient id="cloudGrad" x1="12" y1="16" x2="52" y2="46" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F8FAFC" />
            <stop offset="1" stopColor="#94A3B8" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (category === 'rain') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M20 40H45C50 40 54 36 54 31C54 26.3 50.4 22.5 45.8 22.1C44.1 15.8 38.4 11 31.5 11C23.5 11 17 17.5 17 25.5C17 26.1 17.1 26.7 17.2 27.3C13.6 28.4 11 31.6 11 35.5C11 38.5 13.5 40 17 40H20Z"
          fill="url(#rainCloudGrad)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.5"
        />
        {[22, 32, 42].map((xPos, idx) => (
          <motion.line
            key={xPos}
            x1={xPos}
            y1="45"
            x2={xPos - 3}
            y2="54"
            stroke="#38BDF8"
            strokeWidth="2.6"
            strokeLinecap="round"
            animate={
              reducedMotion
                ? undefined
                : { y: [0, 5, 0], opacity: [0.4, 1, 0.4] }
            }
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: idx * 0.25,
              ease: 'easeInOut',
            }}
          />
        ))}
        <defs>
          <linearGradient id="rainCloudGrad" x1="12" y1="12" x2="52" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#CBD5E1" />
            <stop offset="1" stopColor="#64748B" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (category === 'storm') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M20 39H45C50 39 54 35 54 30C54 25.3 50.4 21.5 45.8 21.1C44.1 14.8 38.4 10 31.5 10C23.5 10 17 16.5 17 24.5C17 25.1 17.1 25.7 17.2 26.3C13.6 27.4 11 30.6 11 34.5C11 37.5 13.5 39 17 39H20Z"
          fill="url(#stormCloudGrad)"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.5"
        />
        <motion.path
          animate={
            reducedMotion
              ? undefined
              : { opacity: [1, 0.35, 1], scale: [1, 1.05, 1] }
          }
          transition={{ duration: 1.8, repeat: Infinity }}
          d="M34 36L26 47H33L30 58L41 45H34L34 36Z"
          fill="#FACC15"
          stroke="#FEF08A"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="stormCloudGrad" x1="11" y1="10" x2="54" y2="39" gradientUnits="userSpaceOnUse">
            <stop stopColor="#94A3B8" />
            <stop offset="1" stopColor="#334155" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (category === 'snow') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M20 40H45C50 40 54 36 54 31C54 26.3 50.4 22.5 45.8 22.1C44.1 15.8 38.4 11 31.5 11C23.5 11 17 17.5 17 25.5C17 26.1 17.1 26.7 17.2 27.3C13.6 28.4 11 31.6 11 35.5C11 38.5 13.5 40 17 40H20Z"
          fill="url(#snowCloudGrad)"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.5"
        />
        {[22, 32, 42].map((xPos, idx) => (
          <motion.circle
            key={xPos}
            cx={xPos}
            cy="49"
            r="2.6"
            fill="#E0F2FE"
            animate={
              reducedMotion
                ? undefined
                : { y: [-2, 4, -2], opacity: [0.5, 1, 0.5] }
            }
            transition={{
              duration: 2.2,
              repeat: Infinity,
              delay: idx * 0.35,
              ease: 'easeInOut',
            }}
          />
        ))}
        <defs>
          <linearGradient id="snowCloudGrad" x1="12" y1="11" x2="52" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F1F5F9" />
            <stop offset="1" stopColor="#94A3B8" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // fog
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 36H45C49.5 36 53 32.5 53 28C53 23.8 49.8 20.4 45.6 20C44 14.3 38.8 10 32.5 10C25 10 19 16 19 23.5C19 24.1 19.1 24.7 19.2 25.2C15.9 26.2 13.5 29.1 13.5 32.5C13.5 35 15.8 36 19 36H20Z"
        fill="#CBD5E1"
        opacity="0.85"
      />
      {[43, 50, 57].map((yPos, idx) => (
        <motion.line
          key={yPos}
          x1={16 + idx * 2}
          y1={yPos}
          x2={48 - idx * 2}
          y2={yPos}
          stroke="#E2E8F0"
          strokeWidth="3"
          strokeLinecap="round"
          animate={reducedMotion ? undefined : { x: [-2, 2, -2] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            delay: idx * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </svg>
  );
};
