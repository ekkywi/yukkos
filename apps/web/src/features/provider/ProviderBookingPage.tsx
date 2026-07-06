import { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import { ProviderAPI, type ProviderBooking } from '../../services/provider.service';

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

export function ProviderBookingPage() {
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadBookings = useCallback(async () => {
    try {
      setError('');
      const data = await ProviderAPI.getBookings();
      setBookings(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat booking.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const summary = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((booking) => booking.status === 'PENDING').length;
    const approved = bookings.filter((booking) => booking.status === 'APPROVED').length;
    const rejected = bookings.filter((booking) => booking.status === 'REJECTED').length;

    return { total, pending, approved, rejected };
  }, [bookings]);

  const handleUpdateStatus = async (bookingId: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(bookingId);
    setError('');
    setSuccess('');

    try {
      await ProviderAPI.updateBookingStatus(bookingId, status);
      setSuccess(status === 'APPROVED' ? 'Booking berhasil disetujui.' : 'Booking berhasil ditolak.');
      await loadBookings();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Gagal memperbarui booking.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4 xl:space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-brand-primary">Pesanan Booking</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Daftar booking masuk</h2>
            <p className="mt-1 text-sm text-slate-600">
              {isLoading ? 'Memuat data...' : `${bookings.length} booking dari penyewa`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 text-center sm:grid-cols-4">
            {[
              { label: 'Total', value: summary.total, tone: 'text-slate-950' },
              { label: 'Pending', value: summary.pending, tone: 'text-amber-600' },
              { label: 'Approve', value: summary.approved, tone: 'text-brand-primary' },
              { label: 'Reject', value: summary.rejected, tone: 'text-rose-600' },
            ].map((item) => (
              <div key={item.label} className="px-2 py-1.5">
                <p className={`text-lg font-black ${item.tone}`}>{isLoading ? '...' : item.value}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {summary.pending > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Ada {summary.pending} booking yang perlu diproses.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-black text-slate-900">Semua pesanan</h3>
          <p className="mt-0.5 text-xs text-slate-500">Approve atau reject booking dari penyewa.</p>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-[1180px] w-full table-fixed divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="w-[22%] whitespace-nowrap px-4 py-3">Penyewa</th>
                <th className="w-[27%] whitespace-nowrap px-4 py-3">Hunian</th>
                <th className="w-[13%] whitespace-nowrap px-4 py-3">Check-in</th>
                <th className="w-[12%] whitespace-nowrap px-4 py-3">Durasi</th>
                <th className="w-[14%] whitespace-nowrap px-4 py-3">Total</th>
                <th className="w-[12%] whitespace-nowrap px-4 py-3">Status</th>
                <th className="w-[10%] whitespace-nowrap px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr key={booking.id} className="align-top hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <p className="truncate font-bold text-slate-950">{booking.tenantName ?? booking.tenantId}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(booking.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="truncate font-semibold text-slate-900">{booking.listingName ?? booking.listingId}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{booking.listingCity ?? '-'}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(booking.checkInDate)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{booking.durationMonths} bulan</td>
                    <td className="whitespace-nowrap px-4 py-3 font-black text-brand-primary">{formatMoney(booking.totalPrice)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={[
                          'rounded-md px-2.5 py-1 text-xs font-bold ring-1',
                          statusClasses[booking.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200',
                        ].join(' ')}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {booking.status === 'PENDING' ? (
                          <>
                            <Button
                              type="button"
                              onClick={() => handleUpdateStatus(booking.id, 'APPROVED')}
                              className="rounded-lg bg-brand-primary px-3 py-2 text-sm font-bold text-white transition hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-70"
                              disabled={processingId === booking.id}
                            >
                              {processingId === booking.id ? 'Proses...' : 'Approve'}
                            </Button>
                            <Button
                              type="button"
                              onClick={() => handleUpdateStatus(booking.id, 'REJECTED')}
                              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 transition hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-70"
                              disabled={processingId === booking.id}
                            >
                              {processingId === booking.id ? 'Proses...' : 'Reject'}
                            </Button>
                          </>
                        ) : (
                          <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
                            Selesai
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                    {isLoading ? 'Memuat booking...' : 'Belum ada booking masuk.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 lg:hidden">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <article key={booking.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="line-clamp-2 break-words text-sm font-bold text-slate-950">
                        {booking.tenantName ?? booking.tenantId}
                      </h3>
                      <span
                        className={[
                          'rounded-md px-2 py-1 text-xs font-bold ring-1',
                          statusClasses[booking.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200',
                        ].join(' ')}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-slate-600">{booking.listingName ?? booking.listingId}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Check-in {formatDate(booking.checkInDate)} / {booking.durationMonths} bulan
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-black text-brand-primary">{formatMoney(booking.totalPrice)}</p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {booking.status === 'PENDING' ? (
                    <>
                      <Button
                        type="button"
                        onClick={() => handleUpdateStatus(booking.id, 'APPROVED')}
                        className="rounded-lg bg-brand-primary px-3 py-2 text-sm font-bold text-white"
                        disabled={processingId === booking.id}
                      >
                        {processingId === booking.id ? 'Proses...' : 'Approve'}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleUpdateStatus(booking.id, 'REJECTED')}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700"
                        disabled={processingId === booking.id}
                      >
                        {processingId === booking.id ? 'Proses...' : 'Reject'}
                      </Button>
                    </>
                  ) : (
                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
                      Booking sudah diproses
                    </span>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="px-4 py-12 text-center text-sm text-slate-500">
              {isLoading ? 'Memuat booking...' : 'Belum ada booking masuk.'}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProviderBookingPage;
