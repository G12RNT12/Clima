import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary de React para capturar errores inesperados de renderizado
 * y permitir recuperar la sesión sin pantalla en blanco.
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
          <div className="max-w-md w-full glass-panel rounded-3xl p-8 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold text-white">
              Ocurrió un problema al mostrar el observatorio
            </h1>
            <p className="text-sm text-white/70">
              {this.state.error?.message ||
                'Se produjo un error inesperado en la interfaz.'}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-5 py-2.5 text-sm transition"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Recargar aplicación</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
