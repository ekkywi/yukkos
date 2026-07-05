import { Injectable, Inject } from '@nestjs/common';
import { I_BOOKING_REPOSITORY } from '../../../domain/repositories/i-booking.repository';
import type { IBookingRepository } from '../../../domain/repositories/i-booking.repository';
import { BookingEntity } from '../../../domain/entities/booking.entity';

@Injectable()
export class GetTenantBookingsUseCase {
  constructor(
    @Inject(I_BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async execute(tenantId: string): Promise<BookingEntity[]> {
    return this.bookingRepository.findAllByTenantId(tenantId);
  }
}