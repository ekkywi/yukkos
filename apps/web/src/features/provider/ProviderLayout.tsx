import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

const navigationItems = [
  { to: '/provider/dashboard', label: 'Dashboard', meta: 'Ringkasan hunian' },
  { to: '/provider/hunian', label: 'Hunian', meta: 'Daftar hunian' },
  { to: '/provider/bookings', label: 'Pesanan', meta: 'Booking masuk' },
];

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    'group flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-semibold transition',
    isActive
      ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
      : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950',
  ].join(' ');

export function ProviderLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    window.localStorage.removeItem('access_token');
    window.localStorage.removeItem('user_role');
    navigate('/', { replace: true });
  };

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-[1800px] lg:grid-cols-[272px_minmax(0,1fr)] 2xl:max-w-[1920px]">
        <aside className="border-b border-slate-200 bg-white px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
          <button
            type="button"
            onClick={() => navigate('/provider/dashboard')}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-base font-black text-white">
              Y
            </div>
            <div className="min-w-0">
              <div className="truncate text-lg font-black tracking-tight text-brand-primary">
                Yuk<span className="text-slate-900">Kos</span> Provider
              </div>
              <p className="truncate text-xs font-medium text-slate-500">Akun Provider</p>
            </div>
          </button>

          <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-slate-950">Status akun</p>
              <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-brand-primary ring-1 ring-emerald-200">
                Akun aktif
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-600">Hunian Anda tampil di katalog publik.</p>
          </div>

          <nav className="mt-4 space-y-1.5">
            {navigationItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClassName}>
                <span>
                  <span className="block">{item.label}</span>
                  <span className="block text-xs font-medium opacity-70">{item.meta}</span>
                </span>
                <span className="h-2 w-2 rounded-full bg-current opacity-45" />
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 grid gap-2">
            <Link
              to="/provider/hunian?create=1"
              className="rounded-lg bg-brand-primary px-3 py-2.5 text-center text-sm font-bold text-white transition hover:bg-brand-secondary"
            >
              Tambah Hunian
            </Link>
            <Link
              to="/"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-center text-sm font-bold text-slate-700 transition hover:border-brand-primary/40 hover:text-brand-primary"
            >
              Lihat Katalog
            </Link>
          </div>

          <Button
            onClick={handleLogout}
            className="mt-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-primary/40 hover:text-brand-primary"
          >
            Keluar
          </Button>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
            <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase text-brand-primary">Pusat Provider YukKos</p>
                <h1 className="mt-1 text-lg font-bold tracking-tight text-slate-950">
                  Kelola hunian dan pesanan booking
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-brand-primary/40 hover:text-brand-primary"
                >
                  Katalog
                </Link>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                  Portal Provider
                </div>
                <Button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:text-brand-primary lg:hidden"
                >
                  Keluar
                </Button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:hidden">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-semibold transition',
                      isActive
                        ? 'border-brand-primary bg-brand-primary text-white'
                        : 'border-slate-200 bg-white text-slate-600',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </header>

          <section className="flex-1 px-4 py-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            <Outlet />
          </section>
        </div>
      </div>
    </main>
  );
}

export default ProviderLayout;
