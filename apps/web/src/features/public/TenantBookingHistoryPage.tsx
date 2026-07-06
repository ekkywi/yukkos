import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookingAPI, type TenantBookingResponse } from '../../services/booking.service';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
});

const statusClasses: Record<string, string> = {
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

function StatsCard({
  label,
  value,
  tone,
  accent,
}: {
  label: string;
  value: number;
  tone: string;
  accent: string;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className={`h-1 ${accent}`} />
      <div className="p-4">
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <p className={`mt-2 text-2xl font-black tracking-tight ${tone}`}>{value}</p>
      </div>
    </article>
  );
}

export function TenantBookingHistoryPage() {
  const [bookings, setBookings] = useState<TenantBookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setError('');
        const data = await BookingAPI.getTenantBookings();
        setBookings(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Gagal memuat riwayat booking.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, []);

  const summary = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((booking) => booking.status === 'PENDING').length;
    const approved = bookings.filter((booking) => booking.status === 'APPROVED').length;
    const rejected = bookings.filter((booking) => booking.status === 'REJECTED').length;

    return { total, pending, approved, rejected };
  }, [bookings]);

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-slate-900">
      <div className="mx-auto max-w-[1600px] space-y-4 px-4 py-6 sm:px-6 lg:px-8 xl:space-y-5 xl:px-10">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-0 h-48 w-48 rounded-full bg-brand-primary/10 blur-3xl" />
          <div className="absolute right-0 top-12 h-56 w-56 rounded-full bg-amber-200/20 blur-3xl" />
        </div>

        <div className="relative grid gap-5 p-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-6">
          <div>
            <span className="inline-flex rounded-full border border-brand-primary/15 bg-brand-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-primary">
              Tenant Center
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
              Riwayat booking saya
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Pantau status booking yang pernah kamu kirim, lihat hunian yang dipilih, dan cek ringkasan prosesnya
              dalam satu tempat.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/"
                className="rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-secondary"
              >
                Lihat katalog
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-brand-primary hover:text-brand-primary"
              >
                Masuk ulang
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-600">Booking aktif</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-brand-primary">{summary.total}</p>
              <p className="mt-1 text-xs text-slate-500">Semua booking yang pernah kamu kirim.</p>
            </article>
            <article className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-700">Menunggu proses</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-amber-600">{summary.pending}</p>
              <p className="mt-1 text-xs text-slate-500">Booking yang belum diputuskan.</p>
            </article>
            <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-700">Disetujui</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-emerald-600">{summary.approved}</p>
              <p className="mt-1 text-xs text-slate-500">Booking yang sudah diterima.</p>
            </article>
            <article className="rounded-2xl border border-rose-100 bg-rose-50 p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-700">Ditolak</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-rose-600">{summary.rejected}</p>
              <p className="mt-1 text-xs text-slate-500">Booking yang tidak dilanjutkan.</p>
            </article>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total Booking" value={summary.total} tone="text-slate-950" accent="bg-brand-primary" />
        <StatsCard label="Pending" value={summary.pending} tone="text-amber-600" accent="bg-amber-500" />
        <StatsCard label="Disetujui" value={summary.approved} tone="text-emerald-600" accent="bg-emerald-500" />
        <StatsCard label="Ditolak" value={summary.rejected} tone="text-rose-600" accent="bg-rose-500" />
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div>
          <h2 className="text-sm font-black text-slate-900">Daftar riwayat booking</h2>
          <p className="mt-0.5 text-xs text-slate-500">Pantau status booking hunian yang pernah kamu kirim.</p>
        </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {bookings.length} data
          </span>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-[1040px] w-full table-fixed divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="w-[28%] whitespace-nowrap px-4 py-3">Hunian</th>
                <th className="w-[13%] whitespace-nowrap px-4 py-3">Check-in</th>
                <th className="w-[10%] whitespace-nowrap px-4 py-3">Durasi</th>
                <th className="w-[14%] whitespace-nowrap px-4 py-3">Total</th>
                <th className="w-[13%] whitespace-nowrap px-4 py-3">Status</th>
                <th className="w-[16%] whitespace-nowrap px-4 py-3">Dibuat</th>
                <th className="w-[6%] whitespace-nowrap px-4 py-3">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr key={booking.id} className="align-top hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <p className="truncate font-bold text-slate-950">{booking.listingName ?? booking.listingId}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{booking.listingCity ?? '-'}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(booking.checkInDate)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{booking.durationMonths} bulan</td>
                    <td className="whitespace-nowrap px-4 py-3 font-black text-brand-primary">
                      {formatMoney(booking.totalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          'inline-flex rounded-md px-2.5 py-1 text-xs font-bold ring-1',
                          statusClasses[booking.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200',
                        ].join(' ')}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {booking.createdAt ? formatDate(booking.createdAt) : '-'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-400">{booking.id.slice(0, 8)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                    {isLoading ? 'Memuat riwayat booking...' : 'Belum ada booking yang pernah kamu kirim.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 lg:hidden">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <article key={booking.id} className="p-4 transition hover:bg-slate-50/70">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-bold text-slate-950">
                        {booking.listingName ?? booking.listingId}
                      </h3>
                      <span
                        className={[
                          'rounded-md px-2 py-1 text-[11px] font-bold ring-1',
                          statusClasses[booking.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200',
                        ].join(' ')}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">{booking.listingCity ?? '-'}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Check-in {formatDate(booking.checkInDate)} / {booking.durationMonths} bulan
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-black text-brand-primary">{formatMoney(booking.totalPrice)}</p>
                </div>

                <div className="mt-3 grid gap-1 text-xs text-slate-500">
                  <span>Dibuat: {booking.createdAt ? formatDate(booking.createdAt) : '-'}</span>
                  <span>ID booking: {booking.id}</span>
                </div>
              </article>
            ))
          ) : (
            <div className="px-4 py-12 text-center text-sm text-slate-500">
              {isLoading ? 'Memuat riwayat booking...' : 'Belum ada booking yang pernah kamu kirim.'}
            </div>
          )}
        </div>
      </section>
      </div>
    </main>
  );
}

export default TenantBookingHistoryPage;
