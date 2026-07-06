import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import heroBedroom from '../../assets/hero-bedroom.jpg';
import { ListingCard } from '../../components/ui/ListingCard';
import { ListingAPI, type WebListing } from '../../services/listing.service';

type PriceFilter = 'ALL' | 'UNDER_1000K' | '1000K_2000K' | 'ABOVE_2000K';
type SortOption = 'PRICE_ASC' | 'PRICE_DESC' | 'DEFAULT';
type ItemsPerPageOption = 8 | 12 | 16 | 24;
type AuthSnapshot = {
  token: string | null;
  role: string | null;
};

const priceOptions: Array<{ value: PriceFilter; label: string }> = [
  { value: 'ALL', label: 'Semua harga' },
  { value: 'UNDER_1000K', label: '< Rp1 juta' },
  { value: '1000K_2000K', label: 'Rp1 - 2 juta' },
  { value: 'ABOVE_2000K', label: '> Rp2 juta' },
];

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: 'PRICE_ASC', label: 'Harga termurah' },
  { value: 'PRICE_DESC', label: 'Harga termahal' },
  { value: 'DEFAULT', label: 'Default' },
];

const itemsPerPageOptions: ItemsPerPageOption[] = [8, 12, 16, 24];

const filterByPrice = (price: number, filter: PriceFilter) => {
  if (filter === 'ALL') return true;
  if (filter === 'UNDER_1000K') return price < 1_000_000;
  if (filter === '1000K_2000K') return price >= 1_000_000 && price <= 2_000_000;
  return price > 2_000_000;
};

const getCityOptions = (listings: WebListing[]) =>
  Array.from(new Set(listings.map((listing) => listing.city.trim()).filter(Boolean))).sort((left, right) =>
    left.localeCompare(right, 'id'),
  );

const getStoredAuth = (): AuthSnapshot => {
  if (typeof window === 'undefined') {
    return { token: null, role: null };
  }

  return {
    token: window.localStorage.getItem('access_token'),
    role: window.localStorage.getItem('user_role'),
  };
};

const getUserLabel = (role: string | null) => {
  if (role === 'PROVIDER') return 'Provider';
  if (role === 'TENANT') return 'Tenant';
  return 'Akun';
};

const quickPicks = ['Dekat kampus', 'Budget < 1 juta', 'Siap booking', 'Fasilitas lengkap'];

function SelectChevron() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-slate-400">
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-slate-400">
      <path
        d="M10.75 18.5a7.75 7.75 0 1 1 0-15.5 7.75 7.75 0 0 1 0 15.5ZM16.5 16.5 21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<WebListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('PRICE_ASC');
  const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPageOption>(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [auth, setAuth] = useState<AuthSnapshot>(() => getStoredAuth());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await ListingAPI.getWebListings();
        setListings(data);
      } catch {
        setError('Gagal memuat daftar hunian. Pastikan backend aktif.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  useEffect(() => {
    const syncAuth = () => setAuth(getStoredAuth());

    syncAuth();
    window.addEventListener('storage', syncAuth);

    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  useEffect(() => {
    if (!isUserMenuOpen) {
      return;
    }

    const closeUserMenu = () => setIsUserMenuOpen(false);

    window.addEventListener('click', closeUserMenu);

    return () => window.removeEventListener('click', closeUserMenu);
  }, [isUserMenuOpen]);

  const cityOptions = useMemo(() => getCityOptions(listings), [listings]);
  const providerCount = useMemo(
    () => new Set(listings.map((listing) => listing.providerName.trim()).filter(Boolean)).size,
    [listings],
  );
  const featuredCities = cityOptions.slice(0, 4);

  const filteredListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return listings.filter((listing) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        listing.name.toLowerCase().includes(normalizedQuery) ||
        listing.city.toLowerCase().includes(normalizedQuery) ||
        listing.shortDescription.toLowerCase().includes(normalizedQuery);
      const matchesCity = cityFilter === 'ALL' || listing.city === cityFilter;
      const matchesPrice = filterByPrice(listing.monthlyPrice, priceFilter);

      return matchesQuery && matchesCity && matchesPrice;
    });
  }, [cityFilter, listings, priceFilter, query]);

  const sortedListings = useMemo(() => {
    const nextListings = [...filteredListings];

    if (sortBy === 'PRICE_ASC') {
      return nextListings.sort((left, right) => left.monthlyPrice - right.monthlyPrice);
    }

    if (sortBy === 'PRICE_DESC') {
      return nextListings.sort((left, right) => right.monthlyPrice - left.monthlyPrice);
    }

    return nextListings;
  }, [filteredListings, sortBy]);

  const totalListings = listings.length;
  const availableCount = listings.filter((listing) => listing.status === 'AVAILABLE').length;
  const hasActiveFilters = query.trim().length > 0 || cityFilter !== 'ALL' || priceFilter !== 'ALL';
  const totalPages = Math.max(1, Math.ceil(sortedListings.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedListings = sortedListings.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );
  const currentRangeStart = sortedListings.length === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;
  const currentRangeEnd = Math.min(safeCurrentPage * itemsPerPage, sortedListings.length);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const handleCardClick = (id: string) => {
    navigate(`/hunian/${id}`);
  };

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as SortOption);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setQuery('');
    setCityFilter('ALL');
    setPriceFilter('ALL');
    setSortBy('PRICE_ASC');
    setItemsPerPage(12);
    setCurrentPage(1);
  };

  const handleLogout = () => {
    window.localStorage.removeItem('access_token');
    window.localStorage.removeItem('user_role');
    setAuth({ token: null, role: null });
    setIsUserMenuOpen(false);
  };

  const isLoggedIn = Boolean(auth.token);
  const isTenant = auth.role === 'TENANT';
  const userLabel = getUserLabel(auth.role);
  const heroStats = [
    { label: 'Hunian aktif', value: totalListings.toString(), tone: 'text-brand-primary' },
    { label: 'Tersedia', value: availableCount.toString(), tone: 'text-emerald-600' },
    { label: 'Kota', value: cityOptions.length.toString(), tone: 'text-slate-950' },
    { label: 'Provider', value: providerCount.toString(), tone: 'text-amber-600' },
  ];

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:px-8 xl:px-10">
          <div className="flex items-center justify-between gap-3 lg:w-64 lg:shrink-0">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-lg font-black text-white">
                Y
              </span>
              <span>
                <span className="block text-xl font-extrabold text-brand-primary">
                  Yuk<span className="text-slate-900">Kos</span>
                </span>
                <span className="block text-xs font-medium text-slate-500">Cari hunian sesuai budget</span>
              </span>
            </button>

            <div className="relative flex items-center gap-2 lg:hidden" onClick={(event) => event.stopPropagation()}>
              {isLoggedIn ? (
                <>
                  <Button
                    type="button"
                    onClick={() => setIsUserMenuOpen((isOpen) => !isOpen)}
                    className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-primary hover:text-brand-primary"
                  >
                    <UserIcon />
                    {userLabel}
                  </Button>
                  {isUserMenuOpen ? (
                    <div className="absolute right-0 top-12 z-[60] w-40 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                      <div className="space-y-1">
                        {isTenant ? (
                          <Link
                            to="/riwayat-booking"
                            className="block rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-brand-primary"
                          >
                            Riwayat Booking
                          </Link>
                        ) : null}
                        <Button
                          type="button"
                          onClick={handleLogout}
                          className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-status-danger"
                        >
                          Logout
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <Link to="/register" className="text-sm font-semibold text-slate-600">
                    Daftar
                  </Link>
                  <Button
                    onClick={() => navigate('/login')}
                    className="rounded-lg border border-brand-primary px-3 py-2 text-sm font-semibold text-brand-primary"
                  >
                    Masuk
                  </Button>
                </>
              )}
            </div>
          </div>

          <label className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Cari hunian, kota, atau fasilitas"
              className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
            />
          </label>

          <div className="relative hidden items-center gap-3 lg:flex" onClick={(event) => event.stopPropagation()}>
            {isLoggedIn ? (
              <>
                <Button
                  type="button"
                  onClick={() => setIsUserMenuOpen((isOpen) => !isOpen)}
                  className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-primary hover:text-brand-primary"
                >
                  <UserIcon />
                  {userLabel}
                </Button>
                {isUserMenuOpen ? (
                  <div className="absolute right-0 top-12 z-[60] w-44 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                    <div className="space-y-1">
                      {isTenant ? (
                        <Link
                          to="/riwayat-booking"
                          className="block rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-brand-primary"
                        >
                          Riwayat Booking
                        </Link>
                      ) : null}
                      <Button
                        type="button"
                        onClick={handleLogout}
                        className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-status-danger"
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-slate-600 transition hover:text-brand-primary"
                >
                  Daftar
                </Link>
                <Button
                  onClick={() => navigate('/login')}
                  className="rounded-lg border border-brand-primary px-4 py-2.5 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white"
                >
                  Masuk
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-slate-50">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-8 h-56 w-56 rounded-full bg-brand-primary/10 blur-3xl" />
          <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-amber-200/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1600px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-10">
          <div className="grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] xl:gap-8">
            <div>
              <span className="inline-flex rounded-full border border-brand-primary/15 bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-primary shadow-sm">
                Cari hunian yang pas
              </span>
              <h1 className="mt-4 max-w-2xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Cari hunian yang cocok tanpa muter-muter
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                Mulai dari kota dan budget yang kamu mau, lalu lihat pilihan yang masuk akal di satu tempat.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  onClick={() => document.getElementById('daftar-kos')?.scrollIntoView({ behavior: 'smooth' })}
                  className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-secondary"
                >
                  Lihat hunian
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-primary hover:text-brand-primary"
                >
                  Masuk
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {featuredCities.length > 0
                  ? featuredCities.map((city) => (
                      <span
                        key={city}
                        className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm"
                      >
                        {city}
                      </span>
                    ))
                  : null}
                {quickPicks.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-brand-primary/15 bg-brand-primary/5 px-3 py-1.5 text-xs font-semibold text-brand-primary"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {heroStats.map((stat) => (
                  <article
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur"
                  >
                    <p className={`text-2xl font-black tracking-tight ${stat.tone}`}>{stat.value}</p>
                    <p className="mt-1 text-sm font-medium text-slate-600">{stat.label}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-brand-primary/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_20px_80px_rgba(15,23,42,0.14)]">
                <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100">
                  <div className="relative aspect-[4/3]">
                    <img src={heroBedroom} alt="Kamar hunian yang terang dan rapi" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-primary shadow-sm">
                        Booking cepat
                      </span>
                      <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-bold text-white shadow-sm">
                        Update harian
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="max-w-xs rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Mulai dari sini</p>
                        <p className="mt-1 text-lg font-black text-slate-950">Lihat yang cocok, baru bandingkan</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Filter cepat, urutkan harga, lalu pilih hunian yang paling masuk.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Info hunian', value: 'Jelas' },
                    { label: 'Booking', value: 'Lebih cepat' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                      <p className="mt-2 text-xl font-black text-slate-950">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50/80 py-5">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto_auto] lg:items-end">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Kota</span>
              <div className="relative">
                <select
                  value={cityFilter}
                  onChange={(event) => {
                    setCityFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                >
                  <option value="ALL">Semua kota</option>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <SelectChevron />
                </span>
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Harga per bulan</span>
              <div className="relative">
                <select
                  value={priceFilter}
                  onChange={(event) => {
                    setPriceFilter(event.target.value as PriceFilter);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                >
                  {priceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <SelectChevron />
                </span>
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Urutkan</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <SelectChevron />
                </span>
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Tampilkan</span>
              <div className="relative">
                <select
                  value={itemsPerPage}
                  onChange={(event) => {
                    setItemsPerPage(Number(event.target.value) as ItemsPerPageOption);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 lg:w-28"
                >
                  {itemsPerPageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <SelectChevron />
                </span>
              </div>
            </label>

            <Button
              onClick={resetFilters}
              className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-brand-primary hover:text-brand-primary"
            >
              Reset filter
            </Button>
          </div>

          {hasActiveFilters ? (
            <div className="mt-3 text-sm text-slate-500">
              {sortedListings.length} hunian sesuai filter aktif.
            </div>
          ) : null}
        </div>
      </section>

      <section id="daftar-kos" className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-[370px] animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-status-danger/20 bg-white px-5 py-4 text-status-danger shadow-sm">
            {error}
          </div>
        ) : sortedListings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Belum ada hunian yang cocok</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Coba ubah kata kunci, pilih kota lain, atau atur ulang filter harga.
            </p>
            <Button
              onClick={resetFilters}
              className="mt-5 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-secondary"
            >
              Tampilkan semua hunian
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onClick={handleCardClick} />
              ))}
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                Menampilkan {currentRangeStart}-{currentRangeEnd} dari {sortedListings.length} hunian
              </p>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm hide-scrollbar">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeCurrentPage === 1}
                  className="h-9 rounded-lg border border-slate-300 bg-white px-3 font-semibold text-slate-700 transition hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sebelumnya
                </button>

                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`h-9 min-w-9 rounded-lg px-3 font-semibold transition ${
                      pageNumber === safeCurrentPage
                        ? 'bg-brand-primary text-white'
                        : 'border border-slate-300 bg-white text-slate-700 hover:border-brand-primary hover:text-brand-primary'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="h-9 rounded-lg border border-slate-300 bg-white px-3 font-semibold text-slate-700 transition hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default LandingPage;
