import { Injectable, Inject } from '@nestjs/common';
import { I_LISTING_REPOSITORY } from '../../../domain/repositories/i-listing.repository';
import type { IListingRepository } from '../../../domain/repositories/i-listing.repository';
import { MobileListingResponseDto } from '../../dtos/listing/mobile-listing-response.dto';

@Injectable()
export class GetMobileListingsUseCase {
  constructor(
    @Inject(I_LISTING_REPOSITORY)
    private readonly listingRepository: IListingRepository,
  ) {}

  async execute(): Promise<MobileListingResponseDto[]> {
    const listings = await this.listingRepository.findAllActive();

    return listings.map((listing) => ({
        id: listing.id,
        name: listing.name,
        city: listing.city,
        monthlyPrice: listing.monthlyPrice,
        status: listing.status,
        }));
  }
}