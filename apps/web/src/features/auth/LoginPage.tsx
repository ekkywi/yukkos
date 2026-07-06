import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { login } from '../../services/auth.service';

type LocationState = {
  from?: string;
};

const INITIAL_FORM = {
  email: '',
  password: '',
};

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = typeof state?.from === 'string' && state.from.length > 0 ? state.from : '/';

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(form);

      if (!result.accessToken || !result.role) {
        throw new Error('Respons autentikasi tidak lengkap.');
      }

      localStorage.setItem('access_token', result.accessToken);
      localStorage.setItem('user_role', result.role);

      if (result.role === 'PROVIDER') {
        navigate('/provider/dashboard', { replace: true });
        return;
      }

      navigate(from, { replace: true });
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Gagal masuk. Silakan periksa email dan kata sandi Anda.';

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={() => navigate('/')} className="flex min-w-0 items-center gap-2 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary text-lg font-black text-white">
              Y
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xl font-extrabold text-brand-primary">
                Yuk<span className="text-slate-900">Kos</span>
              </span>
              <span className="block truncate text-xs font-medium text-slate-500">Cari hunian sesuai budget</span>
            </span>
          </button>

          <div className="flex items-center gap-3">
            <Link to="/" className="hidden text-sm font-semibold text-slate-600 transition hover:text-brand-primary sm:inline">
              Katalog
            </Link>
            <Link
              to="/register"
              className="rounded-lg border border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white"
            >
              Daftar
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
        <aside className="hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:block">
          <div className="inline-flex rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
            YukKos
          </div>
          <h1 className="mt-5 max-w-md text-3xl font-bold leading-tight text-slate-950">
            Masuk dan lanjut cari hunian sesuai budget.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            Kelola pencarian, booking hunian, dan status pengajuan dari satu akun.
          </p>
          <div className="mt-6 grid gap-3">
            {['Cari hunian berdasarkan kota dan harga', 'Booking hunian lebih cepat', 'Pantau status pengajuan'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-primary" />
                <span className="text-sm font-medium text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </aside>

        <section className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-sm font-bold text-brand-primary">Masuk akun</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Masuk ke YukKos</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Lanjut cari hunian sesuai budget.</p>
          </div>

          {error ? (
            <div className="mt-5 rounded-lg border border-status-danger/20 bg-status-danger/10 px-3 py-2.5 text-sm font-medium text-status-danger">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="nama@email.com"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                placeholder="Masukkan password"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                required
              />
            </label>

            <Button
              type="submit"
              className="w-full rounded-lg bg-brand-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sedang masuk...' : 'Masuk'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Belum punya akun?{' '}
            <Link to="/register" className="font-bold text-brand-primary transition hover:text-brand-secondary">
              Daftar akun
            </Link>
          </p>
        </section>
      </section>
    </main>
  );
}

export default LoginPage;
