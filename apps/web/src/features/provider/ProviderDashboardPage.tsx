import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProviderAPI, type ProviderBooking, type ProviderListing } from '../../services/provider.service';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
});

const statusClasses: Record<string, string> = {
  AVAILABLE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  FULL: 'bg-rose-50 text-rose-700 ring-rose-200',
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 ring-rose-200',
  CANCELLED: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const formatMoney = (value: number) => moneyFormatter.format(value);

const formatDate = (value?: string) => {
  if (!value) return '-';

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? value : dateFormatter.format(parsed);
};

export function ProviderDashboardPage() {
  const [listings, setListings] = useState<ProviderListing[]>([]);
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [listingData, bookingData] = await Promise.all([
          ProviderAPI.getListings(),
          ProviderAPI.getBookings(),
        ]);

        setListings(listingData);
        setBookings(bookingData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Gagal memuat ringkasan dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const summary = useMemo(() => {
    const totalListings = listings.length;
    const availableListings = listings.filter((listing) => listing.status === 'AVAILABLE').length;
    const fullListings = listings.filter((listing) => listing.status === 'FULL').length;
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((booking) => booking.status === 'PENDING').length;
    const approvedBookings = bookings.filter((booking) => booking.status === 'APPROVED').length;

    return {
      totalListings,
      availableListings,
      fullListings,
      totalBookings,
      pendingBookings,
      approvedBookings,
    };
  }, [bookings, listings]);

  const pendingBookings = bookings.filter((booking) => booking.status === 'PENDING').slice(0, 4);
  const recentBookings = bookings.slice(0, 6);
  const recentListings = listings.slice(0, 5);

  return (
    <div className="space-y-4 xl:space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr] 2xl:gap-5">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-lg font-black text-white">
                Y
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-slate-950">Akun Provider</h2>
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-brand-primary ring-1 ring-emerald-200">
                    Akun aktif
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {summary.totalListings} hunian dikelola, {summary.pendingBookings} booking perlu diproses.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 text-center">
              <div className="px-3 py-2">
                <p className="text-lg font-black text-slate-950">{isLoading ? '...' : summary.totalListings}</p>
                <p className="text-xs font-medium text-slate-500">Hunian</p>
              </div>
              <div className="px-3 py-2">
                <p className="text-lg font-black text-brand-primary">{isLoading ? '...' : summary.availableListings}</p>
                <p className="text-xs font-medium text-slate-500">Tersedia</p>
              </div>
              <div className="px-3 py-2">
                <p className="text-lg font-black text-amber-600">{isLoading ? '...' : summary.pendingBookings}</p>
                <p className="text-xs font-medium text-slate-500">Pending</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-bold text-slate-950">Aksi cepat</p>
          <div className="mt-3 grid gap-2">
            <Link
              to="/provider/hunian?create=1"
              className="rounded-lg bg-brand-primary px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-brand-secondary"
            >
              Tambah Hunian
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/provider/bookings"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold text-slate-700 transition hover:border-brand-primary/40 hover:text-brand-primary"
              >
                Kelola Booking
              </Link>
              <Link
                to="/"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold text-slate-700 transition hover:border-brand-primary/40 hover:text-brand-primary"
              >
                Lihat Katalog
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:gap-4">
        {[
          { label: 'Total Hunian', value: summary.totalListings, hint: 'Produk aktif', tone: 'bg-brand-primary' },
          { label: 'Hunian Tersedia', value: summary.availableListings, hint: 'Bisa dipesan', tone: 'bg-emerald-500' },
          { label: 'Booking Masuk', value: summary.totalBookings, hint: 'Total pesanan', tone: 'bg-slate-400' },
          { label: 'Perlu Diproses', value: summary.pendingBookings, hint: 'Prioritas hari ini', tone: 'bg-amber-500' },
        ].map((card) => (
          <article key={card.label} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className={`h-1 ${card.tone}`} />
            <div className="p-4">
              <p className="text-sm font-semibold text-slate-600">{card.label}</p>
              <div className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                {isLoading ? '...' : card.value}
              </div>
              <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
            </div>
          </article>
        ))}
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid items-stretch gap-4 xl:grid-cols-[0.95fr_1.05fr] 2xl:gap-5">
        <section className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div>
            <p className="text-xs font-semibold uppercase text-amber-600">Perlu diproses</p>
            <h2 className="text-base font-black text-slate-950">Booking pending</h2>
            </div>
            <Link to="/provider/bookings" className="text-sm font-bold text-brand-primary hover:text-brand-secondary">
              Lihat semua
            </Link>
          </div>

          <div className="flex-1 divide-y divide-slate-100">
            {pendingBookings.length > 0 ? (
              pendingBookings.map((booking) => (
                <article key={booking.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="line-clamp-1 break-words text-sm font-bold text-slate-950">
                        {booking.tenantName ?? booking.tenantId}
                      </h3>
                      <p className="mt-1 line-clamp-1 text-sm text-slate-600">{booking.listingName ?? booking.listingId}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Check-in {formatDate(booking.checkInDate)} / {booking.durationMonths} bulan
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-black text-brand-primary">{formatMoney(booking.totalPrice)}</p>
                      <span className="mt-1 inline-flex rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                        PENDING
                      </span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="px-4 py-10 text-center text-sm text-slate-500">
                {isLoading ? 'Memuat booking...' : 'Tidak ada booking pending.'}
              </div>
            )}
          </div>
        </section>

        <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div>
            <p className="text-xs font-semibold uppercase text-brand-primary">Booking terbaru</p>
              <h2 className="text-base font-black text-slate-950">Daftar pesanan</h2>
            </div>
            <Link to="/provider/bookings" className="text-sm font-bold text-brand-primary hover:text-brand-secondary">
              Kelola
            </Link>
          </div>

          <div className="flex-1 min-h-0">
            {recentBookings.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentBookings.map((booking) => (
                  <article key={booking.id} className="px-4 py-3 transition hover:bg-slate-50/60">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-bold text-slate-950">
                            {booking.tenantName ?? booking.tenantId}
                          </h3>
                          <span
                            className={[
                              'inline-flex rounded-md px-2 py-1 text-[11px] font-bold ring-1',
                              statusClasses[booking.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200',
                            ].join(' ')}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                          {booking.listingName ?? booking.listingId}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>Check-in {formatDate(booking.checkInDate)}</span>
                          <span>{booking.durationMonths} bulan</span>
                          <span>{booking.listingCity ?? '-'}</span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black text-brand-primary">{formatMoney(booking.totalPrice)}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {booking.createdAt ? formatDate(booking.createdAt) : '-'}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="px-4 py-10 text-center text-sm text-slate-500">
                {isLoading ? 'Memuat booking...' : 'Belum ada booking masuk.'}
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div>
            <p className="text-xs font-semibold uppercase text-brand-primary">Ringkasan hunian</p>
            <h2 className="text-base font-black text-slate-950">Hunian terbaru</h2>
          </div>
          <Link to="/provider/hunian" className="text-sm font-bold text-brand-primary hover:text-brand-secondary">
            Lihat semua
          </Link>
        </div>

        <div className="grid gap-4 p-4 xl:grid-cols-[240px_minmax(0,1fr)]">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-2xl font-black text-brand-primary">{isLoading ? '...' : summary.availableListings}</p>
              <p className="text-sm font-semibold text-slate-700">Hunian tersedia</p>
            </div>
            <div className="rounded-lg border border-rose-100 bg-rose-50 p-3">
              <p className="text-2xl font-black text-rose-600">{isLoading ? '...' : summary.fullListings}</p>
              <p className="text-sm font-semibold text-slate-700">Hunian penuh</p>
            </div>
          </div>

          <div className="min-w-0 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {recentListings.length > 0 ? (
              recentListings.map((listing) => (
                <article key={listing.id} className="flex items-start justify-between gap-4 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-slate-950">{listing.name}</h3>
                    <p className="mt-0.5 truncate text-xs leading-5 text-slate-500">
                      {listing.city} / {listing.facilities.length} fasilitas
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-black text-brand-primary">{formatMoney(listing.monthlyPrice)}</p>
                    <span
                      className={[
                        'mt-1 inline-flex rounded-md px-2 py-1 text-xs font-bold ring-1',
                        statusClasses[listing.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200',
                      ].join(' ')}
                    >
                      {listing.status}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <div className="px-4 py-10 text-center text-sm text-slate-500">
                {isLoading ? 'Memuat data hunian...' : 'Belum ada hunian yang didaftarkan.'}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProviderDashboardPage;
