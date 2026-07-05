import { BookingEntity, BookingStatus } from '../entities/booking.entity';

export const I_BOOKING_REPOSITORY = 'IBookingRepository';

export type CreateBookingPayload = Omit<BookingEntity, 'id' | 'status' | 'createdAt' | 'updatedAt'>;

export interface IBookingRepository {
  create(data: CreateBookingPayload): Promise<BookingEntity>;
  updateStatus(id: string, status: BookingStatus): Promise<BookingEntity>;
  
  findById(id: string): Promise<BookingEntity | null>;
  
  findAllByTenantId(tenantId: string): Promise<BookingEntity[]>;
  findAllByProviderId(providerId: string): Promise<BookingEntity[]>;
}