import axios from 'axios';
import { httpClient } from '../infrastructure/http';

export type StatusListing = 'AVAILABLE' | 'FULL';

export interface WebListing {
  id: string;
  name: string;
  providerName: string;
  city: string;
  monthlyPrice: number;
  shortDescription: string;
  mainImage: string | null;
  status: StatusListing;
}

export interface WebListingDetail extends WebListing {
  images: string[];
  fullAddress: string;
  description: string;
  facilities: string[];
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null;

const toText = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);

const toNumber = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const normalizeStatus = (value: unknown): StatusListing => {
  if (value === 'AVAILABLE' || value === 'FULL') {
    return value;
  }

  return 'AVAILABLE';
};

const normalizeListing = (value: unknown): WebListing | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toText(value.id);
  const name = toText(value.name, 'Kos tanpa nama');
  const providerName = toText(value.providerName, '');
  const city = toText(value.city, 'Lokasi belum tersedia');
  const shortDescription =
    toText(value.shortDescription) ||
    toText(value.description).slice(0, 80) ||
    'Deskripsi belum tersedia.';
  const monthlyPrice = toNumber(value.monthlyPrice);
  const mainImage = typeof value.mainImage === 'string' && value.mainImage.length > 0 ? value.mainImage : null;
  const status = normalizeStatus(value.status);

  if (!id) {
    return null;
  }

  return {
    id,
    name,
    providerName,
    city,
    monthlyPrice,
    shortDescription,
    mainImage,
    status,
  };
};

const normalizeListingDetail = (value: unknown): WebListingDetail | null => {
  if (!isRecord(value)) {
    return null;
  }

  const normalized = normalizeListing(value);

  if (!normalized) {
    return null;
  }

  const facilities = Array.isArray(value.facilities)
    ? value.facilities.filter((facility): facility is string => typeof facility === 'string')
    : [];
  const images = Array.isArray(value.images)
    ? value.images.filter((image): image is string => typeof image === 'string' && image.length > 0)
    : [];

  return {
    ...normalized,
    images,
    fullAddress: toText(value.fullAddress, ''),
    description: toText(value.description, ''),
    facilities,
  };
};

const unwrapListingPayload = (payload: unknown): unknown[] => {
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

export const ListingAPI = {
  getWebListings: async (): Promise<WebListing[]> => {
    try {
      const response = await httpClient.get('/v1/web/listings');
      const rawData = response?.data?.data ?? response?.data ?? [];

      return unwrapListingPayload(rawData)
        .map(normalizeListing)
        .filter((listing): listing is WebListing => listing !== null);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Endpoint web listing tidak ditemukan. Pastikan backend aktif di port 3000.', {
          cause: error,
        });
      }

      if (axios.isAxiosError(error) && !error.response) {
        throw new Error('Frontend belum terhubung ke backend. Pastikan server backend berjalan di port 3000.', {
          cause: error,
        });
      }

      throw error;
    }
  },

  getWebListingDetail: async (id: string): Promise<WebListingDetail> => {
    try {
      const response = await httpClient.get(`/v1/web/listings/${id}`);
      const rawData = response?.data?.data ?? response?.data ?? {};
      const listing = normalizeListingDetail(rawData);

      if (!listing) {
        throw new Error('Respons detail kos tidak valid.');
      }

      return listing;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Kos tidak ditemukan.', { cause: error });
      }

      if (axios.isAxiosError(error) && !error.response) {
        throw new Error('Frontend belum terhubung ke backend. Pastikan server backend berjalan di port 3000.', {
          cause: error,
        });
      }

      throw error;
    }
  },
};
