import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { BookingAPI } from '../../services/booking.service';
import { ListingAPI, type WebListingDetail } from '../../services/listing.service';

type AuthSnapshot = {
  token: string | null;
  role: string | null;
};

const FALLBACK_IMAGE = 'https://placehold.co/1200x900/e2e8f0/64748b?text=Kos+Tanpa+Foto';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const getStoredAuth = (): AuthSnapshot => {
  if (typeof window === 'undefined') {
    return { token: null, role: null };
  }

  return {
    token: window.localStorage.getItem('access_token'),
    role: window.localStorage.getItem('user_role'),
  };
};

const getMinDate = () => new Date().toISOString().slice(0, 10);

const getGalleryImages = (listing: WebListingDetail) => {
  const images = [...listing.images, listing.mainImage].filter(
    (image): image is string => typeof image === 'string' && image.length > 0,
  );

  return Array.from(new Set(images)).length > 0 ? Array.from(new Set(images)) : [FALLBACK_IMAGE];
};

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="M15 18 9 12l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M15 18 9 12l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function KosDetailPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [listing, setListing] = useState<WebListingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [form, setForm] = useState({
    checkInDate: getMinDate(),
    durationMonths: 1,
  });
  const [auth, setAuth] = useState<AuthSnapshot>(() => getStoredAuth());

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setError('');
        const data = await ListingAPI.getWebListingDetail(id);
        setListing(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Gagal memuat detail kos.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    } else {
      setError('ID kos tidak valid.');
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const syncAuth = () => setAuth(getStoredAuth());

    syncAuth();
    window.addEventListener('storage', syncAuth);

    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  const galleryImages = useMemo(() => (listing ? getGalleryImages(listing) : [FALLBACK_IMAGE]), [listing]);
  const hasMultipleImages = galleryImages.length > 1;
  const activeImage = galleryImages[activeImageIndex] ?? galleryImages[0] ?? FALLBACK_IMAGE;

  useEffect(() => {
    setActiveImageIndex(0);
    setIsGalleryOpen(false);
  }, [listing?.id]);

  useEffect(() => {
    if (!hasMultipleImages || isGalleryOpen) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveImageIndex((currentIndex) => (currentIndex + 1) % galleryImages.length);
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [galleryImages.length, hasMultipleImages, isGalleryOpen]);

  useEffect(() => {
    if (!isGalleryOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsGalleryOpen(false);
      }

      if (event.key === 'ArrowLeft' && hasMultipleImages) {
        setActiveImageIndex((currentIndex) =>
          currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1,
        );
      }

      if (event.key === 'ArrowRight' && hasMultipleImages) {
        setActiveImageIndex((currentIndex) => (currentIndex + 1) % galleryImages.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryImages.length, hasMultipleImages, isGalleryOpen]);

  const isTenant = auth.role === 'TENANT';
  const isProvider = auth.role === 'PROVIDER';
  const isAvailable = listing?.status === 'AVAILABLE';
  const isLoggedInAsNonTenant = Boolean(auth.token) && !isTenant;
  const bookingDisabled = !listing || !isAvailable || isBookingSubmitting || isLoggedInAsNonTenant;
  const bookingDisabledReason = useMemo(() => {
    if (!listing) return 'Data kos belum tersedia.';
    if (!isAvailable) return 'Kos ini sudah penuh, booking tidak bisa dilakukan.';
    if (isProvider) return 'Akun provider tidak dapat melakukan booking.';
    if (auth.token && !isTenant) return 'Silakan gunakan akun tenant untuk memesan kos.';
    if (!isTenant) return 'Silakan login sebagai tenant untuk memesan kos.';
    return '';
  }, [auth.token, isAvailable, isProvider, isTenant, listing]);

  const handleBookingCta = () => {
    if (!auth.token || !auth.role) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    return;
  };

  const showPreviousImage = () => {
    if (!hasMultipleImages) {
      return;
    }

    setActiveImageIndex((currentIndex) => (currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1));
  };

  const showNextImage = () => {
    if (!hasMultipleImages) {
      return;
    }

    setActiveImageIndex((currentIndex) => (currentIndex + 1) % galleryImages.length);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    setForm((current) => {
      if (name === 'durationMonths') {
        const durationMonths = Math.max(1, Math.floor(Number(value) || 1));

        return {
          ...current,
          durationMonths,
        };
      }

      return {
        ...current,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!listing || !isTenant || !isAvailable) {
      return;
    }

    setIsBookingSubmitting(true);
    setError('');
    setBookingSuccess('');

    try {
      const booking = await BookingAPI.createTenantBooking({
        listingId: listing.id,
        checkInDate: form.checkInDate,
        durationMonths: form.durationMonths,
      });

      setBookingSuccess(
        `Booking berhasil dikirim. Status saat ini: ${booking.status}. Silakan tunggu konfirmasi provider.`,
      );
      setForm((current) => ({
        ...current,
        durationMonths: 1,
        checkInDate: getMinDate(),
      }));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Gagal mengirim booking.');
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  const facilityList = listing?.facilities ?? [];
  const providerName = listing?.providerName.trim() || 'YukKos';
  const statusLabel = listing?.status === 'AVAILABLE' ? 'Tersedia' : 'Penuh';
  const statusClass =
    listing?.status === 'AVAILABLE'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      : 'bg-slate-100 text-slate-600 ring-slate-200';

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f5f7f6] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-12 w-48 animate-pulse rounded-xl bg-white shadow-sm" />
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
            <div className="aspect-[16/10] animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm" />
            <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm" />
          </div>
        </div>
      </main>
    );
  }

  if (error && !listing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7f6] px-4 text-slate-900">
        <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-brand-primary">Kos tidak ditemukan</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Detail kos gagal dimuat</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{error}</p>
          <Button
            onClick={() => navigate('/')}
            className="mt-5 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-secondary"
          >
            Kembali ke beranda
          </Button>
        </section>
      </main>
    );
  }

  if (!listing) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              onClick={() => navigate('/')}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:border-brand-primary hover:text-brand-primary"
              aria-label="Kembali ke katalog"
            >
              <BackIcon />
            </Button>
            <button type="button" onClick={() => navigate('/')} className="flex min-w-0 items-center gap-2 text-left">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary text-base font-black text-white">
                Y
              </span>
              <span className="min-w-0">
                <span className="block truncate text-lg font-extrabold text-brand-primary">
                  Yuk<span className="text-slate-900">Kos</span>
                </span>
                <span className="block truncate text-xs font-medium text-slate-500">Detail kos</span>
              </span>
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {auth.token ? (
              <span className="hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 sm:block">
                {auth.role === 'PROVIDER' ? 'Akun provider aktif' : 'Akun tenant aktif'}
              </span>
            ) : (
              <Link
                to="/login"
                state={{ from: location.pathname }}
                className="rounded-lg border border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-5 xl:grid-cols-[minmax(260px,0.86fr)_minmax(0,1.12fr)_minmax(320px,0.7fr)] xl:items-start">
          <aside className="xl:sticky xl:top-20">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-square bg-slate-100 sm:aspect-[16/10] xl:aspect-square">
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(true)}
                  className="group h-full w-full cursor-zoom-in overflow-hidden"
                  aria-label="Buka galeri foto"
                >
                  <img
                    src={activeImage}
                    alt={`Foto ${listing.name}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                </button>
                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  <span className={`rounded-md px-2.5 py-1 text-xs font-bold ring-1 ${statusClass}`}>
                    {statusLabel}
                  </span>
                  <span className="rounded-md bg-white px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                    {listing.city}
                  </span>
                </div>
                {hasMultipleImages ? (
                  <>
                    <button
                      type="button"
                      onClick={showPreviousImage}
                      className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:text-brand-primary"
                      aria-label="Foto sebelumnya"
                    >
                      <ChevronLeftIcon />
                    </button>
                    <button
                      type="button"
                      onClick={showNextImage}
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:text-brand-primary"
                      aria-label="Foto berikutnya"
                    >
                      <ChevronRightIcon />
                    </button>
                  </>
                ) : null}
                <div className="absolute bottom-3 right-3 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-white">
                  {activeImageIndex + 1} / {galleryImages.length}
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {galleryImages.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={[
                      'h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-slate-100 transition',
                      index === activeImageIndex ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-slate-200 hover:border-brand-primary/50',
                    ].join(' ')}
                    aria-label={`Tampilkan foto ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`Pratinjau ${listing.name}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
              <div className="mt-2 flex justify-center gap-1.5">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={[
                      'h-1.5 rounded-full transition',
                      index === activeImageIndex ? 'w-5 bg-brand-primary' : 'w-1.5 bg-slate-300',
                    ].join(' ')}
                    aria-label={`Pilih slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-md px-2.5 py-1 text-xs font-bold ring-1 ${statusClass}`}>
                  {statusLabel}
                </span>
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  ID {listing.id.slice(0, 8)}
                </span>
              </div>

              <h1 className="mt-3 break-words text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
                {listing.name}
              </h1>

              <div className="mt-4 text-3xl font-extrabold leading-none text-brand-primary sm:text-4xl">
                {moneyFormatter.format(listing.monthlyPrice)}
              </div>
              <p className="mt-1 text-xs font-medium text-slate-500">Harga per bulan</p>

              <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Kota</p>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-900">{listing.city}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Nama pemilik</p>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-900">{providerName}</p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-base font-bold text-slate-950">Alamat</h2>
              <p className="mt-3 break-words text-sm leading-7 text-slate-600">{listing.fullAddress}</p>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-base font-bold text-slate-950">Deskripsi</h2>
              <p className="mt-3 break-words text-sm leading-7 text-slate-600">{listing.description}</p>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-950">Fasilitas</h2>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  {facilityList.length} item
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {facilityList.length > 0 ? (
                  facilityList.map((facility) => (
                    <span
                      key={facility}
                      className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700"
                    >
                      {facility}
                    </span>
                  ))
                ) : (
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
                    Belum ada fasilitas
                  </span>
                )}
              </div>
            </section>
          </div>

          <aside className="xl:sticky xl:top-20">
            <section className="rounded-xl border border-brand-primary/20 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-950">Atur booking</h2>
                  <p className="mt-1 text-xs text-slate-500">Pilih tanggal masuk dan durasi sewa.</p>
                </div>
                <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-bold ring-1 ${statusClass}`}>
                  {statusLabel}
                </span>
              </div>

              <div className="mt-4 rounded-lg bg-slate-50 p-3">
                <p className="line-clamp-2 break-words text-sm font-semibold text-slate-900">{listing.name}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-xl font-extrabold leading-none text-brand-primary">
                      {moneyFormatter.format(listing.monthlyPrice)}
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-slate-500">per bulan</p>
                  </div>
                  <span className="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                    {form.durationMonths} bulan
                  </span>
                </div>
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {bookingDisabledReason || 'Pilih tanggal masuk dan durasi sewa untuk mengirim booking.'}
              </p>

              {bookingSuccess ? (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700">
                  {bookingSuccess}
                </div>
              ) : null}

              {error ? (
                <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700">
                  {error}
                </div>
              ) : null}

              {!auth.token ? (
                <Button
                  onClick={handleBookingCta}
                  disabled={!isAvailable}
                  className="mt-5 w-full rounded-lg bg-brand-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAvailable ? 'Masuk untuk Booking' : 'Kos Sudah Penuh'}
                </Button>
              ) : isLoggedInAsNonTenant ? (
                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600">
                  {bookingDisabledReason}
                </div>
              ) : !isAvailable ? (
                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600">
                  Kos sudah penuh, booking dinonaktifkan.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Tanggal check-in</span>
                    <input
                      type="date"
                      name="checkInDate"
                      value={form.checkInDate}
                      min={getMinDate()}
                      onChange={handleChange}
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                      required
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Durasi sewa</span>
                    <input
                      type="number"
                      name="durationMonths"
                      value={form.durationMonths}
                      min={1}
                      step={1}
                      onChange={handleChange}
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                      required
                    />
                    <p className="text-xs text-slate-500">Minimal 1 bulan</p>
                  </label>

                  <Button
                    type="submit"
                    className="w-full rounded-lg bg-brand-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={bookingDisabled}
                  >
                    {isBookingSubmitting ? 'Mengirim booking...' : 'Kirim Booking'}
                  </Button>

                  <p className="text-xs leading-5 text-slate-500">
                    Booking akan masuk ke provider untuk ditinjau. Pastikan tanggal masuk dan durasi sudah benar.
                  </p>
                </form>
              )}
            </section>
          </aside>
        </div>
      </section>

      {isGalleryOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/88 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Preview foto kos"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsGalleryOpen(false);
            }
          }}
        >
          <div className="relative flex h-full w-full max-w-6xl flex-col">
            <div className="mb-3 flex items-center justify-between gap-3 text-white">
              <div>
                <p className="line-clamp-1 text-sm font-semibold">{listing.name}</p>
                <p className="mt-0.5 text-xs text-white/70">
                  {activeImageIndex + 1} dari {galleryImages.length} foto
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Tutup galeri"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-black">
              <img
                src={activeImage}
                alt={`Foto besar ${listing.name}`}
                className="h-full w-full object-contain"
              />
              {hasMultipleImages ? (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-sm transition hover:text-brand-primary"
                    aria-label="Foto sebelumnya"
                  >
                    <ChevronLeftIcon />
                  </button>
                  <button
                    type="button"
                    onClick={showNextImage}
                    className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-sm transition hover:text-brand-primary"
                    aria-label="Foto berikutnya"
                  >
                    <ChevronRightIcon />
                  </button>
                </>
              ) : null}
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {galleryImages.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={[
                    'h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-slate-100 transition',
                    index === activeImageIndex ? 'border-white ring-2 ring-brand-primary' : 'border-white/20 opacity-70 hover:opacity-100',
                  ].join(' ')}
                  aria-label={`Preview foto ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${listing.name}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default KosDetailPage;
