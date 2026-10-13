import React from 'react';

interface WeatherDetailCardProps {
  title: string;
  icon: React.ReactNode;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Tarjeta instrumental glassmórfica reutilizable para mostrar una métrica meteorológica
 * con elevación sutil en hover y tipografía tabular-nums.
 */
export const WeatherDetailCard: React.FC<WeatherDetailCardProps> = ({
  title,
  icon,
  value,
  subtitle,
  children,
  className = '',
}) => {
  return (
    <article
      className={`glass-panel glass-panel-interactive rounded-2xl p-5 flex flex-col justify-between gap-3 ${className}`}
    >
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-white/75">{title}</h3>
        <div className="text-sky-300/90 shrink-0" aria-hidden="true">
          {icon}
        </div>
      </header>

      <div className="space-y-2">
        <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white tabular-nums">
          {value}
        </div>
        {children}
      </div>

      {subtitle && (
        <footer className="text-xs text-white/65 leading-relaxed">
          {subtitle}
        </footer>
      )}
    </article>
  );
};
