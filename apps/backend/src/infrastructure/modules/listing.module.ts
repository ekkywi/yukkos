import { Module } from '@nestjs/common';

import { ProviderListingController } from '../controllers/provider-listing.controller';
import { MobileListingController } from '../controllers/mobile-listing.controller';
import { WebListingController } from '../controllers/web-listing.controller';

import { CreateListingUseCase } from '../../application/use-cases/listing/create-listing.use-case';
import { UpdateListingUseCase } from '../../application/use-cases/listing/update-listing.use-case';
import { DeleteListingUseCase } from '../../application/use-cases/listing/delete-listing.use-case';
import { GetProviderListingsUseCase } from '../../application/use-cases/listing/get-provider-listings.use-case';
import { GetProviderListingDetailUseCase } from '../../application/use-cases/listing/get-provider-listing-detail.use-case';
import { GetMobileListingsUseCase } from '../../application/use-cases/listing/get-mobile-listings.use-case';
import { GetWebListingsUseCase } from '../../application/use-cases/listing/get-web-listings.use-case';
import { GetWebListingDetailUseCase } from '../../application/use-cases/listing/get-web-listing-detail.use-case';

import { PrismaListingRepository } from '../database/prisma/prisma-listing.repository';
import { I_LISTING_REPOSITORY } from '../../domain/repositories/i-listing.repository';
import { PrismaService } from '../database/prisma/prisma.service';

@Module({
  controllers: [
    ProviderListingController,
    MobileListingController,
    WebListingController,
  ],
  providers: [
    PrismaService,
    
    CreateListingUseCase,
    UpdateListingUseCase,
    DeleteListingUseCase,
    GetProviderListingsUseCase,
    GetProviderListingDetailUseCase,
    GetMobileListingsUseCase,
    GetWebListingsUseCase,
    GetWebListingDetailUseCase,
    {
      provide: I_LISTING_REPOSITORY,
      useClass: PrismaListingRepository,
    },
  ],
})
export class ListingModule {}