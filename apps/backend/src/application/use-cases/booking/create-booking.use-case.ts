import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { I_BOOKING_REPOSITORY } from '../../../domain/repositories/i-booking.repository';
import type { IBookingRepository } from '../../../domain/repositories/i-booking.repository';
import { I_LISTING_REPOSITORY } from '../../../domain/repositories/i-listing.repository';
import type { IListingRepository } from '../../../domain/repositories/i-listing.repository';
import { CreateBookingDto } from '../../dtos/booking/create-booking.dto';
import { BookingEntity } from '../../../domain/entities/booking.entity';
import { StatusListing } from '../../../domain/entities/listing.entity';

@Injectable()
export class CreateBookingUseCase {
    constructor(
        @Inject(I_BOOKING_REPOSITORY)
        private readonly bookingRepository: IBookingRepository,
        @Inject(I_LISTING_REPOSITORY)
        private readonly listingRepository: IListingRepository,
    ) {}

    async execute(tenantId: string, dto: CreateBookingDto): Promise<BookingEntity> {
        const listing = await this.listingRepository.findById(dto.listingId);
        if (!listing) {
            throw new NotFoundException('Data kos tidak ditemukan.');
        }

        if (listing.status !== StatusListing.AVAILABLE) {
            throw new BadRequestException('Maaf, kos ini sedang tidak tersedia atau sudah penuh.');
        }

        if (listing.providerId === tenantId) {
            throw new BadRequestException('Anda tidak dapat menyewa properti Anda sendiri.');
        }

        const totalPrice = listing.monthlyPrice * dto.durationMonths;

        return this.bookingRepository.create({
            listingId: dto.listingId,
            tenantId,
            checkInDate: new Date(dto.checkInDate),
            durationMonths: dto.durationMonths,
            totalPrice,
        })
    }
}