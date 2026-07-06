import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Landing/runtime error boundary caught:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.15),_transparent_38%),linear-gradient(180deg,_#f8fbff_0%,_#eef7ff_100%)] px-4">
          <section className="w-full max-w-xl rounded-[2rem] border border-white/70 bg-white/80 p-8 text-center shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Terjadi gangguan tampilan
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Halaman gagal dirender
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Kami mendeteksi error runtime di sisi frontend. Coba muat ulang halaman atau kembali ke beranda.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/25 transition hover:bg-brand-secondary"
              >
                Muat ulang
              </button>
              <Link
                to="/"
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-primary/30 hover:text-brand-primary"
              >
                Kembali ke beranda
              </Link>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
