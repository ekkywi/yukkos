import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { ProviderAPI, type ProviderListing, type ProviderListingInput } from '../../services/provider.service';

const MONEY_FORMAT = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const FALLBACK_IMAGE = 'https://placehold.co/320x220/e2e8f0/64748b?text=Kos';

const EMPTY_FORM = {
  name: '',
  city: '',
  fullAddress: '',
  monthlyPrice: '',
  description: '',
  type: 'MIXED',
  status: 'AVAILABLE',
  facilityIds: '',
  mainImage: '',
};

const statusClasses: Record<string, string> = {
  AVAILABLE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  FULL: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const parseFacilityIds = (value: string): number[] | undefined => {
  const ids = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => Number(entry))
    .filter((entry) => Number.isInteger(entry) && entry > 0);

  return ids.length > 0 ? ids : undefined;
};

const toFormState = (listing: ProviderListing) => ({
  name: listing.name,
  city: listing.city,
  fullAddress: listing.fullAddress,
  monthlyPrice: String(listing.monthlyPrice),
  description: listing.description,
  type: listing.type,
  status: listing.status,
  facilityIds: '',
  mainImage: listing.mainImage ?? '',
});

export function ProviderKostPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<ProviderListing[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadListings = useCallback(async () => {
    try {
      setError('');
      const data = await ProviderAPI.getListings();
      setListings(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat data kos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  useEffect(() => {
    if (searchParams.get('create') !== '1') {
      return;
    }

    setSelectedId(null);
    setForm(EMPTY_FORM);
    setError('');
    setSuccess('');
    setIsFormOpen(true);
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const summary = useMemo(() => {
    const available = listings.filter((listing) => listing.status === 'AVAILABLE').length;
    const full = listings.filter((listing) => listing.status === 'FULL').length;

    return { available, full };
  }, [listings]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setSelectedId(null);
    setForm(EMPTY_FORM);
  };

  const closeForm = () => {
    if (isSaving) return;

    setIsFormOpen(false);
    resetForm();
  };

  const openCreateForm = () => {
    resetForm();
    setError('');
    setSuccess('');
    setIsFormOpen(true);
  };

  const openEditForm = (listing: ProviderListing) => {
    setSelectedId(listing.id);
    setForm(toFormState(listing));
    setSuccess('');
    setError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload: ProviderListingInput = {
        name: form.name.trim(),
        city: form.city.trim(),
        fullAddress: form.fullAddress.trim(),
        monthlyPrice: Number(form.monthlyPrice),
        description: form.description.trim(),
        type: form.type as ProviderListingInput['type'],
        status: form.status as ProviderListingInput['status'],
        facilityIds: parseFacilityIds(form.facilityIds),
        mainImage: form.mainImage.trim() || undefined,
      };

      if (
        !payload.name ||
        !payload.city ||
        !payload.fullAddress ||
        !payload.description ||
        !Number.isFinite(payload.monthlyPrice)
      ) {
        throw new Error('Lengkapi data kos terlebih dahulu.');
      }

      if (selectedId) {
        await ProviderAPI.updateListing(selectedId, payload);
        setSuccess('Data kos berhasil diperbarui.');
      } else {
        await ProviderAPI.createListing(payload);
        setSuccess('Data kos berhasil ditambahkan.');
      }

      setIsFormOpen(false);
      resetForm();
      await loadListings();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Gagal menyimpan data kos.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (listingId: string) => {
    const confirmDelete = window.confirm('Hapus data kos ini? Tindakan ini tidak bisa dibatalkan.');

    if (!confirmDelete) return;

    setIsDeletingId(listingId);
    setError('');
    setSuccess('');

    try {
      await ProviderAPI.deleteListing(listingId);
      setSuccess('Data kos berhasil dihapus.');
      if (selectedId === listingId) {
        setIsFormOpen(false);
        resetForm();
      }
      await loadListings();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Gagal menghapus data kos.');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-brand-primary">Produk Kos</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Inventory kos</h2>
            <p className="mt-1 text-sm text-slate-600">
              {isLoading ? 'Memuat data kos...' : `${listings.length} kos terdaftar di toko Anda`}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 text-center">
              <div className="px-3 py-1.5">
                <p className="text-lg font-black text-slate-950">{isLoading ? '...' : listings.length}</p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
              <div className="px-3 py-1.5">
                <p className="text-lg font-black text-brand-primary">{isLoading ? '...' : summary.available}</p>
                <p className="text-xs text-slate-500">Tersedia</p>
              </div>
              <div className="px-3 py-1.5">
                <p className="text-lg font-black text-rose-600">{isLoading ? '...' : summary.full}</p>
                <p className="text-xs text-slate-500">Penuh</p>
              </div>
            </div>

            <Button
              type="button"
              onClick={openCreateForm}
              className="rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-secondary"
            >
              Tambah Kos
            </Button>
          </div>
        </div>
      </section>

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
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div>
            <h3 className="text-sm font-black text-slate-900">Daftar produk kos</h3>
            <p className="mt-0.5 text-xs text-slate-500">Kelola status, harga, dan detail kos.</p>
          </div>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Kos</th>
                <th className="px-4 py-3">Lokasi</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Fasilitas</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listings.length > 0 ? (
                listings.map((listing) => (
                  <tr key={listing.id} className="align-top hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <img
                          src={listing.mainImage || FALLBACK_IMAGE}
                          alt={listing.name}
                          className="h-16 w-20 rounded-lg border border-slate-200 object-cover"
                        />
                        <div className="min-w-0">
                          <h4 className="line-clamp-2 max-w-xs break-words font-bold text-slate-950">
                            {listing.name}
                          </h4>
                          <p className="mt-1 line-clamp-1 max-w-xs text-xs text-slate-500">
                            {listing.description || 'Deskripsi belum tersedia.'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{listing.city}</p>
                      <p className="mt-1 text-xs text-slate-500">{listing.type}</p>
                    </td>
                    <td className="px-4 py-3 font-black text-brand-primary">
                      {MONEY_FORMAT.format(listing.monthlyPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          'rounded-md px-2.5 py-1 text-xs font-bold ring-1',
                          statusClasses[listing.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200',
                        ].join(' ')}
                      >
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {listing.facilities.length > 0 ? `${listing.facilities.length} fasilitas` : 'Tanpa fasilitas'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          onClick={() => openEditForm(listing)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-brand-primary/40 hover:text-brand-primary"
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleDelete(listing.id)}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 transition hover:border-rose-300"
                          disabled={isDeletingId === listing.id}
                        >
                          {isDeletingId === listing.id ? 'Menghapus...' : 'Hapus'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                    {isLoading ? 'Memuat data kos...' : 'Belum ada kos yang terdaftar.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 lg:hidden">
          {listings.length > 0 ? (
            listings.map((listing) => (
              <article key={listing.id} className="p-4">
                <div className="flex gap-3">
                  <img
                    src={listing.mainImage || FALLBACK_IMAGE}
                    alt={listing.name}
                    className="h-20 w-24 shrink-0 rounded-lg border border-slate-200 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="line-clamp-2 break-words text-sm font-bold text-slate-950">{listing.name}</h3>
                      <span
                        className={[
                          'rounded-md px-2 py-1 text-xs font-bold ring-1',
                          statusClasses[listing.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200',
                        ].join(' ')}
                      >
                        {listing.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {listing.city} / {listing.type}
                    </p>
                    <p className="mt-2 font-black text-brand-primary">{MONEY_FORMAT.format(listing.monthlyPrice)}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => openEditForm(listing)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700"
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleDelete(listing.id)}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700"
                    disabled={isDeletingId === listing.id}
                  >
                    {isDeletingId === listing.id ? 'Menghapus...' : 'Hapus'}
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <div className="px-4 py-12 text-center text-sm text-slate-500">
              {isLoading ? 'Memuat data kos...' : 'Belum ada kos yang terdaftar.'}
            </div>
          )}
        </div>
      </section>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-6">
          <div className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase text-brand-primary">Form produk kos</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">
                  {selectedId ? 'Edit data kos' : 'Tambah data kos'}
                </h2>
              </div>
              <Button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
              >
                Tutup
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Nama kos</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                    placeholder="Kos Kenanga"
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Kota</span>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                    placeholder="Surabaya"
                    required
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Alamat lengkap</span>
                <textarea
                  name="fullAddress"
                  value={form.fullAddress}
                  onChange={handleChange}
                  className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                  placeholder="Jl. ... No. ..."
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Harga per bulan</span>
                  <input
                    type="number"
                    name="monthlyPrice"
                    value={form.monthlyPrice}
                    onChange={handleChange}
                    min={0}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                    placeholder="850000"
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Tipe kos</span>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                  >
                    <option value="MIXED">Campur</option>
                    <option value="MALE">Putra</option>
                    <option value="FEMALE">Putri</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Status</span>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="FULL">FULL</option>
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">URL gambar utama</span>
                  <input
                    name="mainImage"
                    value={form.mainImage}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                    placeholder="https://..."
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Fasilitas</span>
                <input
                  name="facilityIds"
                  value={form.facilityIds}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                  placeholder="ID fasilitas, pisahkan dengan koma. Contoh: 1, 2, 3"
                />
                <p className="text-xs text-slate-500">Kosongkan jika belum ingin mengubah fasilitas.</p>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Deskripsi</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="min-h-32 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                  placeholder="Deskripsi singkat kos..."
                  required
                />
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-brand-primary/40 hover:text-brand-primary"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSaving}
                >
                  {isSaving ? 'Menyimpan...' : selectedId ? 'Simpan Perubahan' : 'Tambah Kos'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ProviderKostPage;
