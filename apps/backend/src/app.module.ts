import { Module } from '@nestjs/common';
import { MobileListingController } from './infrastructure/controllers/mobile-listing.controller';
import { WebListingController } from './infrastructure/controllers/web-listing.controller';
import { PrismaService } from './infrastructure/database/prisma.service';
import { PrismaListingRepository } from './infrastructure/database/prisma-listing.repository';
import { LISTING_REPOSITORY } from './domain/listing/listing.repository.interface';
import { GetMobileListingsUseCase } from './application/listing/use-cases/get-mobile-listings.usecase';
import { GetWebListingDetailUseCase } from './application/listing/use-cases/get-web-listing-detail.usecase';

@Module({
  imports: [],
  controllers: [
    MobileListingController,
    WebListingController
  ],
  providers: [
    PrismaService,
    {
      provide: LISTING_REPOSITORY,
      useClass: PrismaListingRepository,
    },
    GetMobileListingsUseCase,
    GetWebListingDetailUseCase
  ],
})
export class AppModule {}