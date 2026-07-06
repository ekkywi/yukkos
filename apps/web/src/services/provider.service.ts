import axios from 'axios';
import { httpClient } from '../infrastructure/http';

export type ProviderListingStatus = 'AVAILABLE' | 'FULL';
export type ProviderListingType = 'MALE' | 'FEMALE' | 'MIXED';
export type ProviderBookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type ProviderFacility = {
  id: number;
  name: string;
};

export type ProviderListing = {
  id: string;
  name: string;
  city: string;
  fullAddress: string;
  monthlyPrice: number;
  description: string;
  type: ProviderListingType;
  status: ProviderListingStatus;
  facilities: string[];
  images: string[];
  mainImage: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProviderBooking = {
  id: string;
  listingId: string;
  tenantId: string;
  status: ProviderBookingStatus;
  checkInDate: string;
  durationMonths: number;
  totalPrice: number;
  createdAt?: string;
  updatedAt?: string;
  listingName?: string;
  tenantName?: string;
  listingCity?: string;
};

export type ProviderListingInput = {
  name: string;
  city: string;
  fullAddress: string;
  monthlyPrice: number;
  description: string;
  type: ProviderListingType;
  status?: ProviderListingStatus;
  facilityIds?: number[];
  images?: string[];
  mainImage?: string;
};

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null;

const unwrapData = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  const nestedData = payload.data;

  if (Array.isArray(nestedData)) {
    return nestedData;
  }

  if (isRecord(nestedData) && Array.isArray(nestedData.data)) {
    return nestedData.data;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  return [];
};

const toText = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);
const toNumber = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const normalizeListingStatus = (value: unknown): ProviderListingStatus =>
  value === 'FULL' ? 'FULL' : 'AVAILABLE';

const normalizeListingType = (value: unknown): ProviderListingType => {
  if (value === 'MALE' || value === 'FEMALE' || value === 'MIXED') {
    return value;
  }

  return 'MIXED';
};

const normalizeBookingStatus = (value: unknown): ProviderBookingStatus => {
  if (value === 'PENDING' || value === 'APPROVED' || value === 'REJECTED' || value === 'CANCELLED') {
    return value;
  }

  return 'PENDING';
};

const normalizeFacility = (value: unknown): ProviderFacility | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = typeof value.id === 'number' && Number.isFinite(value.id) ? value.id : Number(value.id);
  const name = toText(value.name);

  if (!Number.isFinite(id) || id <= 0 || !name) {
    return null;
  }

  return {
    id,
    name,
  };
};

const normalizeListing = (value: unknown): ProviderListing | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toText(value.id);

  if (!id) {
    return null;
  }

  return {
    id,
    name: toText(value.name, 'Hunian tanpa nama'),
    city: toText(value.city, 'Lokasi belum tersedia'),
    fullAddress: toText(value.fullAddress, ''),
    monthlyPrice: toNumber(value.monthlyPrice),
    description: toText(value.description, ''),
    type: normalizeListingType(value.type),
    status: normalizeListingStatus(value.status),
    facilities: Array.isArray(value.facilities) ? value.facilities.filter((facility) => typeof facility === 'string') : [],
    mainImage: typeof value.mainImage === 'string' && value.mainImage.length > 0 ? value.mainImage : null,
    images: (() => {
      const images = Array.isArray(value.images)
        ? value.images.filter((image) => typeof image === 'string' && image.length > 0)
        : [];

      if (images.length > 0) {
        return images;
      }

      return typeof value.mainImage === 'string' && value.mainImage.length > 0 ? [value.mainImage] : [];
    })(),
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : undefined,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : undefined,
  };
};

const normalizeBooking = (value: unknown): ProviderBooking | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toText(value.id);

  if (!id) {
    return null;
  }

  return {
    id,
    listingId: toText(value.listingId),
    tenantId: toText(value.tenantId),
    status: normalizeBookingStatus(value.status),
    checkInDate: toText(value.checkInDate),
    durationMonths: toNumber(value.durationMonths),
    totalPrice: toNumber(value.totalPrice),
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : undefined,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : undefined,
    listingName: typeof value.listingName === 'string' ? value.listingName : undefined,
    tenantName: typeof value.tenantName === 'string' ? value.tenantName : undefined,
    listingCity: typeof value.listingCity === 'string' ? value.listingCity : undefined,
  };
};

const unwrapSingle = (payload: unknown) => {
  if (!isRecord(payload)) {
    return payload;
  }

  if ('data' in payload) {
    return payload.data;
  }

  return payload;
};

const extractErrorMessage = (error: unknown, fallback: string) => {
  const readMessage = (value: unknown): string | null => {
    if (typeof value === 'string' && value.trim()) {
      return value;
    }

    if (Array.isArray(value) && value.every((entry) => typeof entry === 'string')) {
      return value.join(', ');
    }

    if (isRecord(value)) {
      return readMessage(value.message) ?? readMessage(value.error);
    }

    return null;
  };

  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (isRecord(responseData)) {
      const message = readMessage(responseData.message) ?? readMessage(responseData.error);

      if (message) {
        return message;
      }
    }

    if (!error.response) {
      return 'Frontend belum terhubung ke backend. Pastikan server backend berjalan.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const ProviderAPI = {
  getFacilities: async (): Promise<ProviderFacility[]> => {
    try {
      const response = await httpClient.get('/v1/facilities');
      const payload = unwrapSingle(response?.data);

      return unwrapData(payload)
        .map(normalizeFacility)
        .filter((facility): facility is ProviderFacility => facility !== null);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Gagal memuat daftar fasilitas.'), { cause: error });
    }
  },

  uploadListingImage: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await httpClient.post('/v1/media/upload', formData);

      const payload = unwrapSingle(response?.data);

      if (!isRecord(payload) || typeof payload.url !== 'string' || !payload.url) {
        throw new Error('Respons upload gambar tidak valid.');
      }

      return payload.url;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Gagal mengunggah gambar.'), { cause: error });
    }
  },

  getListings: async (): Promise<ProviderListing[]> => {
    try {
      const response = await httpClient.get('/v1/provider/listings');
      const payload = unwrapSingle(response?.data);

      return unwrapData(payload)
        .map(normalizeListing)
        .filter((listing): listing is ProviderListing => listing !== null);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Gagal memuat data hunian provider.'), { cause: error });
    }
  },

  getListingDetail: async (id: string): Promise<ProviderListing> => {
    try {
      const response = await httpClient.get(`/v1/provider/listings/${id}`);
      const data = normalizeListing(unwrapSingle(response?.data));

      if (!data) {
        throw new Error('Respons detail hunian tidak valid.');
      }

      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Gagal memuat detail hunian.'), { cause: error });
    }
  },

  createListing: async (payload: ProviderListingInput): Promise<ProviderListing> => {
    try {
      const response = await httpClient.post('/v1/provider/listings', payload);
      const data = normalizeListing(unwrapSingle(response?.data));

      if (!data) {
        throw new Error('Respons create hunian tidak valid.');
      }

      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Gagal membuat data hunian.'), { cause: error });
    }
  },

  updateListing: async (id: string, payload: ProviderListingInput): Promise<ProviderListing> => {
    try {
      const response = await httpClient.put(`/v1/provider/listings/${id}`, payload);
      const data = normalizeListing(unwrapSingle(response?.data));

      if (!data) {
        throw new Error('Respons update hunian tidak valid.');
      }

      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Gagal memperbarui data hunian.'), { cause: error });
    }
  },

  deleteListing: async (id: string): Promise<void> => {
    try {
      await httpClient.delete(`/v1/provider/listings/${id}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Gagal menghapus data hunian.'), { cause: error });
    }
  },

  getBookings: async (): Promise<ProviderBooking[]> => {
    try {
      const response = await httpClient.get('/v1/provider/bookings');
      const payload = unwrapSingle(response?.data);

      return unwrapData(payload)
        .map(normalizeBooking)
        .filter((booking): booking is ProviderBooking => booking !== null);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Gagal memuat booking provider.'), { cause: error });
    }
  },

  updateBookingStatus: async (
    id: string,
    status: Exclude<ProviderBookingStatus, 'CANCELLED'>,
  ): Promise<ProviderBooking> => {
    try {
      const response = await httpClient.patch(`/v1/provider/bookings/${id}/status`, { status });
      const data = normalizeBooking(unwrapSingle(response?.data));

      if (!data) {
        throw new Error('Respons update booking tidak valid.');
      }

      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Gagal memperbarui status booking.'), { cause: error });
    }
  },
};
