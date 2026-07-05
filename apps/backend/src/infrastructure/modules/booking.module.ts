import { Module } from '@nestjs/common';
import { TenantBookingController } from '../controllers/tenant-booking.controller';
import { ProviderBookingController } from '../controllers/provider-booking.controller';
import { CreateBookingUseCase } from '../../application/use-cases/booking/create-booking.use-case';
import { UpdateBookingStatusUseCase } from '../../application/use-cases/booking/update-booking-status.use-case';
import { GetTenantBookingsUseCase } from '../../application/use-cases/booking/get-tenant-bookings.use-case';
import { I_BOOKING_REPOSITORY } from '../../domain/repositories/i-booking.repository';
import { PrismaBookingRepository } from '../database/prisma/prisma-booking.repository';
import { PrismaService } from '../database/prisma/prisma.service';
import { ListingModule } from './listing.module';

@Module({
  imports: [ListingModule],
  controllers: [
        TenantBookingController,
        ProviderBookingController,
    ],
  providers: [
    PrismaService,
    {
      provide: I_BOOKING_REPOSITORY,
      useClass: PrismaBookingRepository,
    },
    CreateBookingUseCase,
    UpdateBookingStatusUseCase,
    GetTenantBookingsUseCase,
  ],
})
export class BookingModule {}