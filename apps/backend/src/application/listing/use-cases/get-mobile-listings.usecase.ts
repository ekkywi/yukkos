import { Injectable, Inject } from '@nestjs/common';
import { LISTING_REPOSITORY, type IListingRepository } from '../../../domain/listing/listing.repository.interface';
import { MobileListingResponseDto, StatusListingDto } from '../dtos/listing-response.dto';

@Injectable()
export class GetMobileListingsUseCase {
  constructor(
    @Inject(LISTING_REPOSITORY)
    private readonly listingRepository: IListingRepository,
  ) {}

  async execute(): Promise<MobileListingResponseDto[]> {
    const listings = await this.listingRepository.findAllActive();
    
    return listings.map(listing => ({
      id: listing.id,
      name: listing.name,
      city: listing.city,
      monthlyPrice: listing.monthlyPrice,
      status: listing.status as StatusListingDto,
    }));
  }
}