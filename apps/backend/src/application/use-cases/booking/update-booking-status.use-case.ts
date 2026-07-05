import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { I_BOOKING_REPOSITORY } from '../../../domain/repositories/i-booking.repository';
import type { IBookingRepository } from '../../../domain/repositories/i-booking.repository';
import { I_LISTING_REPOSITORY } from '../../../domain/repositories/i-listing.repository';
import type { IListingRepository } from '../../../domain/repositories/i-listing.repository';
import { BookingEntity, BookingStatus } from '../../../domain/entities/booking.entity';
import { StatusListing } from '../../../domain/entities/listing.entity';

@Injectable()
export class UpdateBookingStatusUseCase {
  constructor(
    @Inject(I_BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
    @Inject(I_LISTING_REPOSITORY)
    private readonly listingRepository: IListingRepository,
  ) {}

  async execute(providerId: string, bookingId: string, status: BookingStatus): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Data pemesanan tidak ditemukan.');
    }

    const listing = await this.listingRepository.findById(booking.listingId);
    if (!listing || listing.providerId !== providerId) {
      throw new ForbiddenException('Anda tidak memiliki hak untuk memproses pemesanan ini.');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(`Pemesanan ini sudah diproses dan berstatus ${booking.status}.`);
    }

    const updatedBooking = await this.bookingRepository.updateStatus(bookingId, status);

    if (status === BookingStatus.APPROVED) {
      await this.listingRepository.update(listing.id, providerId, {
        status: StatusListing.FULL,
      });
    }

    return updatedBooking;
  }
}