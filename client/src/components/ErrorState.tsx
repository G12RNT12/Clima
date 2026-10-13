import React from 'react';
import { CloudOff, MapPinOff, RefreshCw, X } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

/**
 * Estado de error claro y accionable cuando falla la red o el servidor backend.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div
      role="alert"
      className="glass-panel rounded-3xl p-8 text-center max-w-lg mx-auto my-8 space-y-4"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-300/30 text-rose-200">
        <CloudOff className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-semibold text-white">
        No pudimos actualizar los datos meteorológicos
      </h2>
      <p className="text-sm text-white/75 leading-relaxed">{message}</p>
      <div className="pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-2xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold px-5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span>Reintentar</span>
        </button>
      </div>
    </div>
  );
};

interface GeolocationBannerProps {
  message: string;
  onDismiss: () => void;
}

/**
 * Aviso informativo no intrusivo cuando el permiso de geolocalización es denegado o falla.
 */
export const GeolocationBanner: React.FC<GeolocationBannerProps> = ({
  message,
  onDismiss,
}) => {
  return (
    <div
      role="status"
      className="glass-panel rounded-2xl px-4 py-3 border-amber-300/35 bg-amber-500/15 flex items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-100"
    >
      <div className="flex items-center gap-2.5">
        <MapPinOff className="h-4 w-4 text-amber-300 shrink-0" aria-hidden="true" />
        <span>{message}</span>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar aviso de ubicación"
        className="rounded-lg p-1 text-amber-200/80 hover:text-white hover:bg-white/10 transition shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
