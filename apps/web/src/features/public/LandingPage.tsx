import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { ListingCard } from '../../components/ui/ListingCard';
import { ListingAPI, type StatusListing, type WebListing } from '../../services/listing.service';

type PriceFilter = 'ALL' | 'UNDER_1000K' | '1000K_2000K' | 'ABOVE_2000K';
type StatusFilter = 'ALL' | StatusListing;
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

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'Semua status' },
  { value: 'AVAILABLE', label: 'Tersedia' },
  { value: 'FULL', label: 'Penuh' },
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
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
        setError('Gagal memuat daftar kos. Pastikan backend aktif.');
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
      const matchesStatus = statusFilter === 'ALL' || listing.status === statusFilter;

      return matchesQuery && matchesCity && matchesPrice && matchesStatus;
    });
  }, [cityFilter, listings, priceFilter, query, statusFilter]);

  const totalListings = listings.length;
  const availableCount = listings.filter((listing) => listing.status === 'AVAILABLE').length;
  const hasActiveFilters =
    query.trim().length > 0 || cityFilter !== 'ALL' || priceFilter !== 'ALL' || statusFilter !== 'ALL';
  const totalPages = Math.max(1, Math.ceil(filteredListings.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedListings = filteredListings.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );
  const currentRangeStart = filteredListings.length === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;
  const currentRangeEnd = Math.min(safeCurrentPage * itemsPerPage, filteredListings.length);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const handleCardClick = (id: string) => {
    navigate(`/kos/${id}`);
  };

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setQuery('');
    setCityFilter('ALL');
    setPriceFilter('ALL');
    setStatusFilter('ALL');
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
  const userLabel = getUserLabel(auth.role);

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:px-8">
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
                <span className="block text-xs font-medium text-slate-500">Cari kos sesuai budget</span>
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
                      <Button
                        type="button"
                        onClick={handleLogout}
                        className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-status-danger"
                      >
                        Logout
                      </Button>
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
              placeholder="Cari kos, kota, atau fasilitas"
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
                    <Button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-status-danger"
                    >
                      Logout
                    </Button>
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

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">Cari kos sesuai lokasi dan budget</h1>
              <p className="text-sm text-slate-500">
                {availableCount} kos tersedia dari {totalListings} pilihan.
              </p>
            </div>
            <p className="text-sm font-medium text-slate-600">
              Menampilkan {currentRangeStart}-{currentRangeEnd} dari {filteredListings.length} kos
            </p>
          </div>

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
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Status</span>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value as StatusFilter);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                >
                  {statusOptions.map((option) => (
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
              {filteredListings.length} kos sesuai filter aktif.
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
        ) : filteredListings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Belum ada kos yang cocok</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Coba ubah kata kunci, pilih kota lain, atau atur ulang filter harga.
            </p>
            <Button
              onClick={resetFilters}
              className="mt-5 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-secondary"
            >
              Tampilkan semua kos
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
                Menampilkan {currentRangeStart}-{currentRangeEnd} dari {filteredListings.length} kos
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
