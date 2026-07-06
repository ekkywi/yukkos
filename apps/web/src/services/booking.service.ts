import axios from 'axios';
import { httpClient } from '../infrastructure/http';

export type TenantBookingInput = {
  listingId: string;
  checkInDate: string;
  durationMonths: number;
};

export type TenantBookingResponse = {
  id: string;
  listingId: string;
  tenantId: string;
  status: string;
  checkInDate: string;
  durationMonths: number;
  totalPrice: number;
  createdAt?: string;
  updatedAt?: string;
};

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null;

const unwrapSingle = (payload: unknown) => {
  if (!isRecord(payload)) {
    return payload;
  }

  if ('data' in payload) {
    return payload.data;
  }

  return payload;
};

const normalizeBooking = (value: unknown): TenantBookingResponse | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = typeof value.id === 'string' ? value.id : '';

  if (!id) {
    return null;
  }

  return {
    id,
    listingId: typeof value.listingId === 'string' ? value.listingId : '',
    tenantId: typeof value.tenantId === 'string' ? value.tenantId : '',
    status: typeof value.status === 'string' ? value.status : 'PENDING',
    checkInDate: typeof value.checkInDate === 'string' ? value.checkInDate : '',
    durationMonths: typeof value.durationMonths === 'number' ? value.durationMonths : 0,
    totalPrice: typeof value.totalPrice === 'number' ? value.totalPrice : 0,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : undefined,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : undefined,
  };
};

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (isRecord(responseData)) {
      const message = responseData.message;

      if (typeof message === 'string') {
        return message;
      }

      if (Array.isArray(message) && message.every((entry) => typeof entry === 'string')) {
        return message.join(', ');
      }
    }

    if (!error.response) {
      return 'Frontend belum terhubung ke backend. Pastikan server backend berjalan di port 3000.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const BookingAPI = {
  createTenantBooking: async (payload: TenantBookingInput): Promise<TenantBookingResponse> => {
    try {
      const response = await httpClient.post('/v1/tenant/bookings', payload);
      const booking = normalizeBooking(unwrapSingle(response?.data));

      if (!booking) {
        throw new Error('Respons booking tidak valid.');
      }

      return booking;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Gagal membuat booking.'));
    }
  },
};
