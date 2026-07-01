import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LISTING_REPOSITORY, type IListingRepository } from '../../../domain/listing/listing.repository.interface';
import { WebListingResponseDto, StatusListingDto } from '../dtos/listing-response.dto';

@Injectable()
export class GetWebListingDetailUseCase {
  constructor(
    @Inject(LISTING_REPOSITORY)
    private readonly listingRepository: IListingRepository,
  ) {}

  async execute(id: string): Promise<WebListingResponseDto> {
    const listing = await this.listingRepository.findById(id);

    if (!listing) {
      throw new NotFoundException(`Listing dengan ID ${id} tidak ditemukan.`);
    }

    const mappedFacilities = listing.facilities 
      ? listing.facilities.map(lf => lf.facility.name)
      : [];

    return {
      id: listing.id,
      name: listing.name,
      city: listing.city,
      fullAddress: listing.fullAddress,
      monthlyPrice: listing.monthlyPrice,
      description: listing.description,
      status: listing.status as StatusListingDto,
      facilities: mappedFacilities,
    };
  }
}