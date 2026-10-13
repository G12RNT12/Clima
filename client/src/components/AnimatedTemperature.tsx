import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface AnimatedTemperatureProps {
  value: number;
  className?: string;
  suffix?: string;
}

/**
 * Contador numérico animado para transiciones suaves al cambiar de ciudad o de unidad (°C / °F).
 * Usa tabular-nums para evitar saltos horizontales de layout.
 */
export const AnimatedTemperature: React.FC<AnimatedTemperatureProps> = ({
  value,
  className = '',
  suffix = '°',
}) => {
  const target = Math.round(value);
  const [displayValue, setDisplayValue] = useState<number>(target);
  const previousRef = useRef<number>(target);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || previousRef.current === target) {
      setDisplayValue(target);
      previousRef.current = target;
      return;
    }

    const startValue = previousRef.current;
    const diff = target - startValue;
    const durationMs = 420;
    const startTime = performance.now();
    let frameId = 0;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Easing out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + diff * eased);
      setDisplayValue(current);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      } else {
        previousRef.current = target;
      }
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [target, reducedMotion]);

  return (
    <span className={`tabular-nums ${className}`}>
      {displayValue}
      {suffix}
    </span>
  );
};
