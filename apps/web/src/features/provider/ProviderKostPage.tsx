import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import {
  ProviderAPI,
  type ProviderFacility,
  type ProviderListing,
  type ProviderListingInput,
} from '../../services/provider.service';

const CITY_OPTIONS = ['Semarang', 'Jakarta', 'Bandung', 'Yogyakarta', 'Surabaya', 'Malang'];

const MONEY_FORMAT = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const FALLBACK_IMAGE = 'https://placehold.co/320x220/e2e8f0/64748b?text=Hunian';

const EMPTY_FORM = {
  name: '',
  city: '',
  fullAddress: '',
  monthlyPrice: '',
  description: '',
  type: 'MIXED',
  status: 'AVAILABLE',
  facilityIds: [] as number[],
  images: [] as string[],
  mainImage: '',
};

const statusClasses: Record<string, string> = {
  AVAILABLE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  FULL: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const MAX_FACILITY_BADGES = 3;

const getFacilityBadges = (facilities: string[]) => {
  const visibleFacilities = facilities.filter(Boolean).slice(0, MAX_FACILITY_BADGES);
  const remainingCount = facilities.length - visibleFacilities.length;

  return {
    visibleFacilities,
    remainingCount,
  };
};

const mapFacilityNamesToIds = (facilityNames: string[], facilityOptions: ProviderFacility[]) => {
  if (facilityNames.length === 0 || facilityOptions.length === 0) {
    return [];
  }

  const facilityNameSet = new Set(facilityNames);

  return facilityOptions.filter((facility) => facilityNameSet.has(facility.name)).map((facility) => facility.id);
};

const toFormState = (listing: ProviderListing, facilityOptions: ProviderFacility[]) => ({
  name: listing.name,
  city: listing.city,
  fullAddress: listing.fullAddress,
  monthlyPrice: String(listing.monthlyPrice),
  description: listing.description,
  type: listing.type,
  status: listing.status,
  facilityIds: mapFacilityNamesToIds(listing.facilities, facilityOptions),
  images: listing.images.length > 0 ? listing.images : listing.mainImage ? [listing.mainImage] : [],
  mainImage: listing.mainImage ?? '',
});

const EMPTY_FORM_STATE = { ...EMPTY_FORM };

const getCoverImage = (images: string[], mainImage: string) => mainImage || images[0] || '';

const getListingImages = (listing: ProviderListing) => {
  if (listing.images.length > 0) {
    return listing.images;
  }

  return listing.mainImage ? [listing.mainImage] : [];
};

function ListingImagePreview({ listing }: { listing: ProviderListing }) {
  const images = getListingImages(listing);
  const coverImage = images[0] || FALLBACK_IMAGE;
  const remainingCount = Math.max(images.length - 1, 0);

  return (
    <div className="flex gap-2">
      <div className="relative shrink-0">
        <img
          src={coverImage}
          alt={listing.name}
          className="h-16 w-20 rounded-lg border border-slate-200 object-cover"
        />
        {images.length > 1 ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-slate-950 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            +{remainingCount}
          </span>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="hidden w-full max-w-[8.5rem] grid-cols-2 gap-1 sm:grid">
          {images.slice(1, 5).map((imageUrl, index) => (
            <img
              key={`${listing.id}-${imageUrl}-${index}`}
              src={imageUrl}
              alt={`Gambar ${index + 2} ${listing.name}`}
              className="h-7 w-full rounded-md border border-slate-200 object-cover"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FacilityMultiSelect({
  options,
  selectedIds,
  onChange,
  isLoading,
  disabled,
}: {
  options: ProviderFacility[];
  selectedIds: number[];
  onChange: (nextIds: number[]) => void;
  isLoading: boolean;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current) return;

      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  const selectedFacilities = options.filter((facility) => selectedIds.includes(facility.id));
  const selectedCount = selectedFacilities.length;
  const previewFacilities = selectedFacilities.slice(0, MAX_FACILITY_BADGES).map((facility) => facility.name);
  const remainingCount = selectedCount - previewFacilities.length;

  const toggleFacility = (facilityId: number) => {
    if (disabled) return;

    const isSelected = selectedIds.includes(facilityId);
    const nextIds = isSelected ? selectedIds.filter((id) => id !== facilityId) : [...selectedIds, facilityId];
    onChange(nextIds);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm outline-none transition hover:border-brand-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 disabled:cursor-not-allowed disabled:bg-slate-50"
        disabled={disabled}
      >
        <span className="min-w-0 flex-1">
          {selectedCount > 0 ? (
            <span className="block min-w-0">
              <span className="block truncate font-semibold text-slate-900">
                {selectedCount} fasilitas dipilih
              </span>
              <span className="block truncate text-xs text-slate-500">
                {previewFacilities.join(', ')}
                {remainingCount > 0 ? ` +${remainingCount} lainnya` : ''}
              </span>
            </span>
          ) : (
            <span className="block text-slate-500">Pilih fasilitas</span>
          )}
        </span>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <span className={['text-xs transition-transform', isOpen ? 'rotate-180' : 'rotate-0'].join(' ')}>⌄</span>
        </span>
      </button>

      {isOpen ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="text-xs font-semibold uppercase text-brand-primary">Daftar fasilitas</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {isLoading ? 'Memuat fasilitas dari database...' : 'Pilih satu atau beberapa fasilitas.'}
            </p>
          </div>

          <div className="max-h-60 overflow-y-auto p-2">
            {isLoading ? (
              <div className="px-2 py-3 text-sm text-slate-500">Memuat daftar fasilitas...</div>
            ) : options.length > 0 ? (
              <div className="space-y-1">
                {options.map((facility) => {
                  const isSelected = selectedIds.includes(facility.id);

                  return (
                    <button
                      key={facility.id}
                      type="button"
                      onClick={() => toggleFacility(facility.id)}
                      className={[
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition',
                        isSelected ? 'bg-brand-primary/5 text-slate-950' : 'hover:bg-slate-50 text-slate-700',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'flex h-4 w-4 items-center justify-center rounded border',
                          isSelected
                            ? 'border-brand-primary bg-brand-primary text-white'
                            : 'border-slate-300 bg-white text-transparent',
                        ].join(' ')}
                      >
                        ✓
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium">{facility.name}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-2 py-3 text-sm text-slate-500">Daftar fasilitas tidak tersedia.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const FacilityBadges = ({ facilities }: { facilities: string[] }) => {
  const { visibleFacilities, remainingCount } = getFacilityBadges(facilities);

  if (visibleFacilities.length === 0) {
    return <span className="text-slate-500">Tanpa fasilitas</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {visibleFacilities.map((facility, index) => (
        <span
          key={`${facility}-${index}`}
          className="inline-flex max-w-full items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700"
        >
          <span className="truncate">{facility}</span>
        </span>
      ))}
      {remainingCount > 0 ? (
        <span className="inline-flex items-center rounded-full border border-brand-primary/15 bg-brand-primary/10 px-2.5 py-1 text-xs font-semibold text-brand-primary">
          +{remainingCount} lainnya
        </span>
      ) : null}
    </div>
  );
};

export function ProviderKostPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<ProviderListing[]>([]);
  const [facilityOptions, setFacilityOptions] = useState<ProviderFacility[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedFacilityNames, setSelectedFacilityNames] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFacilitiesLoading, setIsFacilitiesLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const editRequestRef = useRef(0);

  const loadListings = useCallback(async () => {
    try {
      setError('');
      const data = await ProviderAPI.getListings();
      setListings(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat data hunian.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFacilities = useCallback(async () => {
    try {
      const data = await ProviderAPI.getFacilities();
      setFacilityOptions(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat daftar fasilitas.');
    } finally {
      setIsFacilitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadListings();
    void loadFacilities();
  }, [loadFacilities, loadListings]);

  useEffect(() => {
    if (searchParams.get('create') !== '1') {
      return;
    }

    editRequestRef.current += 1;
    setSelectedId(null);
    setSelectedFacilityNames([]);
    setForm(EMPTY_FORM_STATE);
    setError('');
    setSuccess('');
    setIsFormOpen(true);
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!selectedId || selectedFacilityNames.length === 0 || facilityOptions.length === 0) {
      return;
    }

    setForm((current) => {
      const facilityIds = mapFacilityNamesToIds(selectedFacilityNames, facilityOptions);

      if (facilityIds.length === 0) {
        return current;
      }

      return {
        ...current,
        facilityIds,
      };
    });
  }, [facilityOptions, selectedFacilityNames, selectedId]);

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
    editRequestRef.current += 1;
    setSelectedId(null);
    setSelectedFacilityNames([]);
    setForm(EMPTY_FORM_STATE);
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

  const openEditForm = async (listingId: string) => {
    const requestId = ++editRequestRef.current;

    setError('');
    setSuccess('');

    try {
      const listing = await ProviderAPI.getListingDetail(listingId);

      if (editRequestRef.current !== requestId) {
        return;
      }

      setSelectedId(listing.id);
      setSelectedFacilityNames(listing.facilities);
      setForm(toFormState(listing, facilityOptions));
      setIsFormOpen(true);
    } catch (loadError) {
      if (editRequestRef.current !== requestId) {
        return;
      }

      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat detail hunian.');
    }
  };

  const handleImagesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setIsUploadingImage(true);
    setError('');
    setSuccess('');

    try {
      for (const file of files) {
        const uploadedUrl = await ProviderAPI.uploadListingImage(file);

        setForm((current) => {
          const nextImages = Array.from(new Set([...current.images, uploadedUrl]));

          return {
            ...current,
            images: nextImages,
            mainImage: current.mainImage || uploadedUrl,
          };
        });
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Gagal mengunggah gambar.');
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
  };

  const removeImage = (imageUrl: string) => {
    setForm((current) => {
      const nextImages = current.images.filter((image) => image !== imageUrl);
      const nextMainImage = current.mainImage === imageUrl ? nextImages[0] ?? '' : current.mainImage;

      return {
        ...current,
        images: nextImages,
        mainImage: nextMainImage,
      };
    });
  };

  const setCoverImage = (imageUrl: string) => {
    setForm((current) => ({
      ...current,
      mainImage: imageUrl,
    }));
  };

  const selectedFacilityLabels = useMemo(
    () =>
      form.facilityIds
        .map((facilityId) => facilityOptions.find((facility) => facility.id === facilityId)?.name)
        .filter((facilityName): facilityName is string => Boolean(facilityName)),
    [facilityOptions, form.facilityIds],
  );

  const formImages = useMemo(
    () => (form.images.length > 0 ? form.images : form.mainImage ? [form.mainImage] : []),
    [form.images, form.mainImage],
  );
  const coverImage = getCoverImage(formImages, form.mainImage);

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
        facilityIds: form.facilityIds.length > 0 ? form.facilityIds : undefined,
        images: form.images.length > 0 ? form.images : undefined,
        mainImage: form.mainImage.trim() || undefined,
      };

      if (
        !payload.name ||
        !payload.city ||
        !payload.fullAddress ||
        !payload.description ||
        !Number.isFinite(payload.monthlyPrice)
      ) {
        throw new Error('Lengkapi data hunian terlebih dahulu.');
      }

      if (selectedId) {
        await ProviderAPI.updateListing(selectedId, payload);
        setSuccess('Data hunian berhasil diperbarui.');
      } else {
        await ProviderAPI.createListing(payload);
        setSuccess('Data hunian berhasil ditambahkan.');
      }

      setIsFormOpen(false);
      resetForm();
      await loadListings();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Gagal menyimpan data hunian.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (listingId: string) => {
    const confirmDelete = window.confirm('Hapus data hunian ini? Tindakan ini tidak bisa dibatalkan.');

    if (!confirmDelete) return;

    setIsDeletingId(listingId);
    setError('');
    setSuccess('');

    try {
      await ProviderAPI.deleteListing(listingId);
      setSuccess('Data hunian berhasil dihapus.');
      if (selectedId === listingId) {
        setIsFormOpen(false);
        resetForm();
      }
      await loadListings();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Gagal menghapus data hunian.');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-4 xl:space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-brand-primary">Hunian</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Daftar hunian</h2>
            <p className="mt-1 text-sm text-slate-600">
              {isLoading ? 'Memuat data hunian...' : `${listings.length} hunian terdaftar di akun Anda`}
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
              Tambah Hunian
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
            <h3 className="text-sm font-black text-slate-900">Daftar hunian</h3>
            <p className="mt-0.5 text-xs text-slate-500">Kelola status, harga, dan detail hunian.</p>
          </div>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Hunian</th>
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
                        <ListingImagePreview listing={listing} />
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
                      <FacilityBadges facilities={listing.facilities} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          onClick={() => void openEditForm(listing.id)}
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
                    {isLoading ? 'Memuat data hunian...' : 'Belum ada hunian yang terdaftar.'}
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
                  <div className="shrink-0">
                    <ListingImagePreview listing={listing} />
                  </div>
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
                    <div className="mt-2">
                      <FacilityBadges facilities={listing.facilities} />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => void openEditForm(listing.id)}
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
              {isLoading ? 'Memuat data hunian...' : 'Belum ada hunian yang terdaftar.'}
            </div>
          )}
        </div>
      </section>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-6">
          <div className="w-full max-w-4xl rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase text-brand-primary">Form hunian</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">
                  {selectedId ? 'Edit data hunian' : 'Tambah data hunian'}
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

            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Nama hunian</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                    placeholder="Hunian Kenanga"
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Kota</span>
                  <select
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                    required
                  >
                    <option value="" disabled>
                      Pilih kota
                    </option>
                    {CITY_OPTIONS.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
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

              <div className="grid gap-4 md:grid-cols-2">
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
                  <span className="text-sm font-semibold text-slate-700">Tipe hunian</span>
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

              <div className="grid gap-4 md:grid-cols-2">
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

                <div className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Gambar hunian</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                    className="block h-11 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-brand-primary file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:border-brand-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 disabled:cursor-not-allowed"
                    disabled={isUploadingImage}
                  />
                  <p className="text-xs text-slate-500">
                    {isUploadingImage
                      ? 'Mengunggah gambar ke Cloudinary...'
                      : 'Pilih satu atau beberapa file gambar untuk diupload langsung.'}
                  </p>

                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <div className="border-b border-slate-200 px-3 py-2">
                      <p className="text-xs font-semibold uppercase text-brand-primary">Cover preview</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {formImages.length > 0
                          ? `${formImages.length} gambar terupload`
                          : 'Belum ada gambar yang diupload.'}
                      </p>
                    </div>
                    <img
                      src={coverImage || FALLBACK_IMAGE}
                      alt={form.name || 'Pratinjau gambar hunian'}
                      className="h-44 w-full object-cover"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {formImages.map((imageUrl, index) => {
                      const isCover = imageUrl === coverImage;

                      return (
                        <article
                          key={`${imageUrl}-${index}`}
                          className={[
                            'overflow-hidden rounded-xl border bg-white shadow-sm',
                            isCover ? 'border-brand-primary ring-1 ring-brand-primary/20' : 'border-slate-200',
                          ].join(' ')}
                        >
                          <img
                            src={imageUrl}
                            alt={`Gambar hunian ${index + 1}`}
                            className="h-32 w-full object-cover"
                          />
                          <div className="space-y-2 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-slate-600">Foto {index + 1}</span>
                              {isCover ? (
                                <span className="rounded-md bg-brand-primary/10 px-2 py-1 text-[11px] font-bold text-brand-primary">
                                  Cover
                                </span>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {!isCover ? (
                                <Button
                                  type="button"
                                  onClick={() => setCoverImage(imageUrl)}
                                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:border-brand-primary/40 hover:text-brand-primary"
                                >
                                  Jadikan cover
                                </Button>
                              ) : null}
                              <Button
                                type="button"
                                onClick={() => removeImage(imageUrl)}
                                className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 transition hover:border-rose-300"
                              >
                                Hapus
                              </Button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Fasilitas</span>
                <FacilityMultiSelect
                  options={facilityOptions}
                  selectedIds={form.facilityIds}
                  onChange={(nextIds) =>
                    setForm((current) => ({
                      ...current,
                      facilityIds: nextIds,
                    }))
                  }
                  isLoading={isFacilitiesLoading}
                  disabled={isFacilitiesLoading || facilityOptions.length === 0}
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">
                    {isFacilitiesLoading
                      ? 'Memuat daftar fasilitas dari database...'
                      : 'Pilih satu atau beberapa fasilitas dari daftar master.'}
                  </p>
                  {form.facilityIds.length > 0 ? (
                    <span className="text-xs font-semibold text-brand-primary">
                      {form.facilityIds.length} fasilitas dipilih
                    </span>
                  ) : null}
                </div>
                {selectedFacilityLabels.length > 0 ? <FacilityBadges facilities={selectedFacilityLabels} /> : null}
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Deskripsi</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="min-h-32 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                  placeholder="Deskripsi singkat hunian..."
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
                  disabled={isSaving || isUploadingImage}
                >
                  {isSaving ? 'Menyimpan...' : isUploadingImage ? 'Mengunggah...' : selectedId ? 'Simpan Perubahan' : 'Tambah Hunian'}
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
